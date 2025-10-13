// src/Components/Dashboard/ProductList.jsx
import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // Add Link for navigation
import ProductForm from "./ProductForm";
import EditProductForm from "./EditProductForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const productsPerPage = 8;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Extract the products from the 'data' array in the response
        const productsArray = Array.isArray(data.data) ? data.data : [];

        // Map the API response to the expected format
        const formattedProducts = productsArray.map((item) => ({
          id: item.id, // Add id for navigation
          sku: item.product_code || "",
          product: item.name || "",
          category: item.category?.name || "",
          type: item.is_variable_price ? "Customizable" : "Non-custom",
          price: item.sale_price_inc_tax
            ? `N${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "",
          stock: item.stock || 0,
        }));

        setProducts(formattedProducts);
        toast.success("Products fetched successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (index) => {
    setSelectedProduct(products[index]);
    setSelectedProductIndex(index);
    setIsEditModalOpen(true);
  };

  const handleNewProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSelectedProductIndex(null);
  };

  const handleSaveProduct = (formData) => {
    const newProduct = {
      sku: formData.skuNumber,
      product: formData.productName,
      category: formData.category,
      type: formData.allowCustomization ? "Customizable" : "Non-custom",
      price: `N${parseFloat(formData.price).toLocaleString()}`,
      stock: parseInt(formData.availableStock, 10),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
    toast.success("Product added successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleUpdateProduct = (formData, index) => {
    const updatedProduct = {
      sku: formData.skuNumber,
      product: formData.productName,
      category: formData.category,
      type: formData.allowCustomization ? "Customizable" : "Non-custom",
      price: `N${parseFloat(formData.price).toLocaleString()}`,
      stock: parseInt(formData.availableStock, 10),
    };
    setProducts((prev) =>
      prev.map((item, i) => (i === index ? updatedProduct : item))
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSelectedProductIndex(null);
    toast.success("Product updated successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer />
      <div className="flex w-full justify-end mb-6">
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">Loading products...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-500">{error}</p>
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
                    {paginatedProducts.map((product, index) => (
                      <tr
                        key={startIndex + index}
                        className="hover:bg-gray-50 transition-colors text-[#414245]"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/dashboard/product/${product.id}`}
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {product.product}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.type === "Customizable" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Customizable
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Non-custom
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(startIndex + index)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {paginatedProducts.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No products found matching your search.
                  </p>
                </div>
              )}
              {filteredProducts.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              onSave={handleSaveProduct}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
