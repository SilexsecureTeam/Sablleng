import React, { useState, useEffect, useContext } from "react";
import { Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import EditProductForm from "./EditProductForm";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.sablle.ng/api/products?page=${currentPage}`,
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
      const productsArray = Array.isArray(data.data) ? data.data : [];

      const formattedProducts = productsArray.map((item) => ({
        id: item.id || 0,
        sku: item.product_code || "N/A",
        product: item.name || "Unknown Product",
        category: item.category?.name || "N/A",
        type: item.customize ? "Customizable" : "Non-custom",
        price: item.sale_price_inc_tax
          ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
          : "N/A",
        stock: item.stock_quantity ?? 0,
      }));

      setProducts(formattedProducts);
      setTotalPages(data.last_page || 1);
      toast.success("Products loaded!", { autoClose: 2000 });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setProducts([]);
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => navigate("/admin/signin"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, auth.token]);

  const handleEdit = (index) => {
    setSelectedProduct(products[index]);
    setSelectedProductIndex(index);
    setIsEditModalOpen(true);
  };

  const handleNewProduct = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSelectedProductIndex(null);
  };

  const handleSaveProduct = (formData) => {
    const newProduct = {
      id: formData.id || Date.now(),
      sku: formData.sku || formData.skuNumber,
      product: formData.product || formData.productName,
      category: formData.category || "N/A",
      type: formData.allowCustomization ? "Customizable" : "Non-custom",
      price: `₦${parseFloat(formData.price || 0).toLocaleString()}`,
      stock: parseInt(formData.stock || formData.availableStock || 0, 10),
    };
    setProducts((prev) => [newProduct, ...prev].slice(0, 10));
    setIsModalOpen(false);
    toast.success("Product added!", { autoClose: 3000 });
    fetchProducts();
  };

  const handleUpdateProduct = (formData, index) => {
    const updatedProduct = {
      id: products[index].id,
      sku: formData.skuNumber,
      product: formData.productName,
      category: formData.category,
      type: formData.allowCustomization ? "Customizable" : "Non-custom",
      price: `₦${parseFloat(formData.price).toLocaleString()}`,
      stock: parseInt(formData.availableStock, 10),
    };
    setProducts((prev) =>
      prev.map((item, i) => (i === index ? updatedProduct : item))
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSelectedProductIndex(null);
    toast.success("Product updated!", { autoClose: 3000 });
  };

  const filteredProducts = products.filter((product) =>
    [product.product, product.sku, product.category].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getPageNumbers = () => {
    const max = 5;
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex w-full justify-end mb-6">
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-semibold text-[#141718]">
              Products Inventory
            </h1>
          </div>

          <div className="px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">Loading products...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-b border-gray-200 text-[#414245]">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                          {product.sku}
                        </td>
                        <td className="px-0 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/dashboard/product/${product.id}`}
                            className="text-[#5F1327] hover:text-[#B54F5E] text-[14px] hover:underline max-w-[180px] inline-block break-words whitespace-normal"
                          >
                            {product.product}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.type === "Customizable" ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Customizable
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Non-custom
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                          {product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(index)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-[#5F1327] hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No products found.</p>
                </div>
              )}

              {products.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          currentPage === page
                            ? "bg-[#5F1327] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              onSave={handleSaveProduct}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={selectedProduct}
              index={selectedProductIndex}
              onSave={handleUpdateProduct}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
