import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Edit2, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import EditProductForm from "./EditProductForm"; // Import EditProductForm

const CategoryProducts = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams(); // Category ID from route
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [categoryName, setCategoryName] = useState(""); // For header

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch category details and products
  const fetchCategoryProducts = async (page = 1, search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/categories/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      let allProducts = Array.isArray(data.products) ? data.products : [];

      // Filter by search
      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        allProducts = allProducts.filter((product) =>
          product.name?.toLowerCase().includes(lowerSearch)
        );
      }

      // Pagination
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedProducts = allProducts.slice(start, end);

      setProducts(paginatedProducts);
      setTotalPages(Math.ceil(allProducts.length / itemsPerPage) || 1);
      setCategoryName(data.name || "Category"); // For header
      toast.success(`Loaded ${allProducts.length} products`, {
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts(1, searchQuery);
  }, [id, auth.token, navigate]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchCategoryProducts(1, searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCategoryProducts(page, searchQuery);
  };

  // Handle Edit
  const handleEdit = (product) => {
    const normalizedProduct = {
      id: product.id,
      product: product.name || "N/A",
      sku: product.product_code || "N/A",
      category: product.category?.name || "N/A",
      type: product.customize ? "Customizable" : "Non-custom",
      price: product.sale_price_inc_tax
        ? `₦${parseFloat(product.sale_price_inc_tax).toLocaleString()}`
        : "N/A",
      // stock: product.stock_quantity ?? 0,
    };

    setSelectedProduct(normalizedProduct);
    setIsEditModalOpen(true);
  };

  // handleUpdateProduct — update local list with normalized data
  const handleUpdateProduct = (formData) => {
    const updatedProduct = {
      id: selectedProduct.id,
      product: formData.productName,
      sku: formData.skuNumber,
      category: formData.category,
      type: formData.allowCustomization ? "Customizable" : "Non-custom",
      price: `₦${parseFloat(formData.price).toLocaleString()}`,
      // stock: parseInt(formData.availableStock, 10),
    };

    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      )
    );

    toast.success("Product updated!", { autoClose: 3000 });
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle Delete
  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete product");
      }

      toast.success("Product deleted!", { autoClose: 3000 });
      fetchCategoryProducts(currentPage, searchQuery); // Refresh list
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  const formatPrice = (amount) =>
    `₦${parseFloat(amount || 0).toLocaleString()}`;

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-red-600 text-center py-12">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/categories")}
          className="flex items-center gap-2 text-[#5F1327] hover:bg-[#B54F5E]/10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Categories
        </button>
        <h1 className="text-2xl font-semibold text-[#141718]">
          Products in {categoryName}
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-gray-200 text-[#414245]">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Stock
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "No products match your search."
                      : "No products in this category."}
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#5F1327]">
                      {formatPrice(product.sale_price_inc_tax)}
                    </td>

                    {/* <td className="px-6 py-4 text-sm text-gray-600">
                      {product.stock_quantity ?? 0}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} • Total: {products.length}{" "}
              shown
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
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
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#5F1327] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4 transform rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={selectedProduct}
              onSave={handleUpdateProduct}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
