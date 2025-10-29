import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

const Product = () => {
  const [filter, setFilter] = useState("All");
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered subset
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12; // Fixed number for client-side pagination
  const { addToWishlist, isInWishlist } = useContext(CartContext);

  // Fetch all products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://api.sablle.ng/api/products", // Fetch all without page param
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response structures
        let productsArray;
        if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          productsArray = [];
        }

        const formattedProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "Price Unavailable",
          category: item.category?.name,
          badge: item.customize ? "Customizable" : null,
          image: item.images?.[0] || "/placeholder-image.jpg",
          customize: item.meta?.customizable ?? item.customize ?? false,
        }));

        setAllProducts(formattedProducts);

        // Apply initial filter
        const initialFiltered = applyFilter(formattedProducts, filter);
        setFilteredProducts(initialFiltered);

        // Calculate total pages
        const totalPagesCount = Math.ceil(
          initialFiltered.length / productsPerPage
        );
        setTotalPages(totalPagesCount);
        setCurrentPage(1);

        toast.success(
          `Loaded ${formattedProducts.length} products successfully!`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []); // Only run once on mount

  // Filter function
  const applyFilter = (products, currentFilter) => {
    if (currentFilter === "All") return products;
    if (currentFilter === "Customizable") {
      return products.filter((product) => product.customize === true);
    }
    if (currentFilter === "Non-Customizable") {
      return products.filter((product) => product.customize === false);
    }
    return products;
  };

  // Update filtered products when filter changes
  useEffect(() => {
    const filtered = applyFilter(allProducts, filter);
    setFilteredProducts(filtered);

    // Reset to page 1 and calculate new total pages
    const newTotalPages = Math.ceil(filtered.length / productsPerPage);
    setTotalPages(newTotalPages || 1);
    setCurrentPage(1);

    // Show toast for filtered results
    if (filter !== "All") {
      toast.info(`${filter}: ${filtered.length} products found`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [filter, allProducts, productsPerPage]);

  // Paginate filtered products
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages).keys()].map((i) => i + 1);
    }

    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="py-12 md:py-16">
      <ToastContainer />
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Products ({filteredProducts.length} of {allProducts.length})
          </h3>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            {["All", "Customizable", "Non-Customizable"].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  filter === option
                    ? "bg-[#5F1327] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label={`Filter by ${option} products`}
                aria-pressed={filter === option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-600">
              Loading products...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              {error}
            </div>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200 animate-fade-in"
              >
                <Link to={`/product/${product.id}`} className="block relative">
                  <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                    {product.badge && (
                      <div className="absolute top-6 left-0 bg-[#5F1327] text-white px-8 py-2 rounded text-sm font-medium">
                        {product.badge}
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => addToWishlist(product)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      aria-label={
                        isInWishlist(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={20}
                        className={
                          isInWishlist(product.id)
                            ? "text-[#5F1327] fill-[#5F1327]"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#5F1327] py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600 py-12">
              <div className="text-lg mb-2">
                No {filter.toLowerCase()} products found.
              </div>
              <button
                onClick={() => setFilter("All")}
                className="text-[#5F1327] hover:underline"
              >
                Show all products
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <div className="text-gray-600">
              Page {currentPage} of {totalPages} ({filteredProducts.length}{" "}
              products)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Previous page"
              >
                &laquo; Previous
              </button>
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === page
                      ? "bg-[#5F1327] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Next page"
              >
                Next &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
