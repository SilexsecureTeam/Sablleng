import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

const Product = () => {
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToWishlist, isInWishlist } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.sablle.ng/api/products?page=${page}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        const productsArray = Array.isArray(data.data) ? data.data : [];

        const formattedProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "Price Unavailable",
          category: item.category?.name,
          badge: item.customize ? "Customizable" : null,
          image: item.images?.[0] || "/placeholder-image.jpg",
          customize: item.customize,
        }));

        setProducts(formattedProducts);
        setTotalPages(data.last_page || 1);
        toast.success(`Products fetched successfully for page ${page}`, {
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

    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.customize === true;
    if (filter === "Non-Customizable") return product.customize === false;
    return true;
  });

  return (
    <div className="py-12 md:py-16">
      <ToastContainer />
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Products
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
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
            <div className="col-span-full text-center text-gray-600">
              No products available.
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <div className="text-gray-600">
              Page {currentPage} of {totalPages}
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
              {[...Array(totalPages).keys()]
                .filter((page) =>
                  totalPages <= 10
                    ? true
                    : page + 1 === 1 ||
                      page + 1 === totalPages ||
                      (page + 1 >= currentPage - 2 &&
                        page + 1 <= currentPage + 2)
                )
                .map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === page + 1
                        ? "bg-[#5F1327] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-label={`Page ${page + 1}`}
                    aria-current={currentPage === page + 1 ? "page" : undefined}
                  >
                    {page + 1}
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
