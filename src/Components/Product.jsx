import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

const Product = () => {
  const [filter, setFilter] = useState("All");
  const [allProducts, setAllProducts] = useState([]);
  // const [allCustomProducts, setAllCustomProducts] = useState([]); // ← Commented out
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToWishlist, isInWishlist } = useContext(CartContext);
  const PRODUCTS_PER_PAGE = 30;

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allResponse = await fetch(`https://api.sablle.ng/api/products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!allResponse.ok) {
          throw new Error(
            `Failed to fetch products: ${allResponse.statusText}`
          );
        }

        const allData = await allResponse.json();
        const productsArray = Array.isArray(allData) ? allData : [];

        const formattedAllProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "Unnamed Product",
          price:
            item.sale_price_inc_tax && parseFloat(item.sale_price_inc_tax) > 0
              ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
              : item.customize
              ? "Custom Quote"
              : "Price Unavailable",
          category: item.category?.name || "Uncategorized",
          badge: item.customize ? "Customizable" : null,
          image:
            item.images?.[0]?.url ||
            (item.images?.[0]?.path
              ? `https://api.sablle.ng/storage/${item.images[0].path}`
              : "/placeholder-image.jpg"),
          customize: !!item.customize, // ensure boolean
        }));

        setAllProducts(formattedAllProducts);

        toast.success("Products loaded!", {
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
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Unified filtering using only allProducts + customize flag
  const filteredProducts = allProducts.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.customize === true;
    if (filter === "Non-Customizable") return product.customize === false;
    return true;
  });

  // Pagination
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );
  const displayTotalPages =
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= displayTotalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="py-12 md:py-16">
      <ToastContainer />
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        {/* Filter Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Products
          </h3>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            {["All", "Customizable", "Non-Customizable"].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === option
                    ? "bg-[#5F1327] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-600">Loading products...</div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 py-12">
              {error}
            </div>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/product/${product.id}`} className="block relative">
                  <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                    {product.badge && (
                      <span className="absolute top-6 left-0 bg-[#5F1327] text-white px-6 py-1.5 rounded-r-full text-xs font-medium">
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => addToWishlist(product)}
                      className="p-2 rounded-full hover:bg-gray-100"
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

                  <p className="text-lg font-semibold text-gray-900">
                    {product.price}
                  </p>

                  <p className="text-sm font-bold text-[#5F1327] mt-2">
                    {product.category}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-600">
              No products found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {displayTotalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(displayTotalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  displayTotalPages <= 7 ||
                  page === 1 ||
                  page === displayTotalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded ${
                        currentPage === page
                          ? "bg-[#5F1327] text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (
                  (page === 2 && currentPage > 3) ||
                  (page === displayTotalPages - 1 &&
                    currentPage < displayTotalPages - 2)
                ) {
                  return <span key={page}>...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === displayTotalPages}
                className="px-4 py-2 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
