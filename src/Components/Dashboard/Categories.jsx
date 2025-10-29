import React, { useState, useEffect, useContext } from "react";
import {
  Bell,
  Settings,
  Zap,
  X,
  Edit2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Show Modal
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch categories with pagination & search
  const fetchCategories = async (page = 1, search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch ALL categories first (or use page if backend supports)
      const url = `https://api.sablle.ng/api/categories`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401)
        throw new Error("Unauthorized. Please log in again.");
      if (!response.ok)
        throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      let categoriesArray = Array.isArray(data.data) ? data.data : data;

      // CLIENT-SIDE FILTER BY NAME ONLY
      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        categoriesArray = categoriesArray.filter((cat) =>
          cat.name?.toLowerCase().includes(lowerSearch)
        );
      }

      // CLIENT-SIDE PAGINATION
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginated = categoriesArray.slice(start, end);

      // Fetch product counts for visible items
      const formattedCategories = await Promise.all(
        paginated.map(async (item) => {
          let productCount = 0;
          try {
            const productResponse = await fetch(
              `https://api.sablle.ng/api/categories/${item.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.token}`,
                },
              }
            );

            if (productResponse.ok) {
              const productData = await productResponse.json();
              productCount = Array.isArray(productData.products)
                ? productData.products.length
                : 0;
            }
          } catch (err) {
            console.error(
              `Error fetching products for category ${item.id}:`,
              err
            );
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description || "No description available",
            productCount,
            status: item.is_active ? "Active" : "Inactive",
          };
        })
      );

      setCategories(formattedCategories);
      setTotalPages(Math.ceil(categoriesArray.length / itemsPerPage) || 1);
      toast.success("Categories loaded!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, searchQuery);
  }, [auth.token, navigate]);

  // Search & Pagination
  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories(1, searchQuery);
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCategories(page, searchQuery);
  };

  // Add Category
  const handleAddInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      const file = files[0];
      setAddFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAddImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      toast.error("Category name is required.", { position: "top-right" });
      return;
    }

    setIsAdding(true);
    const submitData = new FormData();
    submitData.append("name", addFormData.name);
    submitData.append("description", addFormData.description || "");
    if (addFormData.image) submitData.append("image", addFormData.image);

    try {
      const response = await fetch("https://api.sablle.ng/api/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed: ${response.statusText}`);
      }

      toast.success("Category added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsAddModalOpen(false);
      setAddFormData({ name: "", description: "", image: null });
      setAddImagePreview(null);
      fetchCategories(currentPage, searchQuery); // Refresh
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Edit Category
  const handleEdit = (category) => {
    setEditFormData({
      name: category.name,
      description: category.description,
      is_active: category.status === "Active",
    });
    setEditingId(category.id);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/categories/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed: ${response.statusText}`);
      }

      toast.success("Category updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsEditModalOpen(false);
      fetchCategories(currentPage, searchQuery); // Refresh
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Show Category & Products
  const handleShow = async (category) => {
    try {
      const response = await fetch(
        `https://api.sablle.ng/api/categories/${category.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch category details");

      const data = await response.json();
      setSelectedCategory(category);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setIsShowModalOpen(true);
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const closeShowModal = () => {
    setIsShowModalOpen(false);
    setSelectedCategory(null);
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer />
      {/* Top Navigation Bar */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C3B7B9] text-gray-700 rounded-md hover:bg-[#C3B7B9]/80 cursor-pointer transition-colors text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          Add Category
        </button>
        <button className="relative p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[#414245] mb-6">
          Products Category
        </h1>

        {/* Search */}
        <div className="mb-4 hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No categories found.</p>
          </div>
        ) : (
          <>
            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white"
                >
                  <div className="absolute top-4 right-4 space-y-1">
                    <span className="px-3 py-1 bg-[#EAFFD8] text-[#1B8401] text-xs font-medium rounded block">
                      {category.status}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShow(category)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="View Products"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pr-20">
                    <h2 className="text-base font-semibold text-[#414245] mb-1">
                      {category.name}
                    </h2>
                    <p className="text-sm text-[#414245] mb-4">
                      {category.description}
                    </p>
                    <p className="text-sm font-medium text-[#414245]">
                      {category.productCount} products
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded-md disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(
                      1,
                      Math.min(totalPages, currentPage - 2 + i)
                    );
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md ${
                          currentPage === page ? "bg-blue-500 text-white" : ""
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded-md disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-[#414245]">
                Add New Category
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={addFormData.name}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Electronics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={addFormData.description}
                  onChange={handleAddInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Category Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  {addImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={addImagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAddFormData((prev) => ({ ...prev, image: null }));
                          setAddImagePreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleAddInputChange}
                        className="hidden"
                      />
                      <div className="text-gray-500">
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-[#414245]">
                Edit Category
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editFormData.is_active}
                  onChange={handleEditInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-[#414245]">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEditing ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Modal with Products */}
      {isShowModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-[#414245]">
                {selectedCategory.name} - Products
              </h2>
              <button
                onClick={closeShowModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {selectedCategory.description}
              </p>
              <p className="text-sm font-medium mb-4">
                Total Products: {products.length}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Product Name
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm">
                          {product.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          ₦
                          {parseFloat(
                            product.sale_price_inc_tax || 0
                          ).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {product.stock_quantity || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No products in this category.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
