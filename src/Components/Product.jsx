import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

const Product = () => {
  const [filter, setFilter] = useState("All");
  const [allProducts, setAllProducts] = useState([]);
  const [allCustomProducts, setAllCustomProducts] = useState([]);
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
        const [allResponse, customResponse] = await Promise.all([
          fetch(`https://api.sablle.ng/api/products`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("https://api.sablle.ng/api/product/customized"),
        ]);

        if (!allResponse.ok) {
          throw new Error(
            `Failed to fetch products: ${allResponse.statusText}`
          );
        }
        if (!customResponse.ok) {
          throw new Error(`Failed to fetch customized products`);
        }

        const allData = await allResponse.json();
        const customData = await customResponse.json();

        const productsArray = Array.isArray(allData) ? allData : [];
        const customProductsArray = Array.isArray(customData.products)
          ? customData.products
          : [];

        const formattedAllProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "Price Unavailable",
          category: item.category?.name,
          badge: item.customize ? "Customizable" : null,
          image:
            item.images?.[0]?.url ||
            (item.images?.[0]?.path
              ? `https://api.sablle.ng/storage/${item.images[0].path}`
              : "/placeholder-image.jpg"),
          customize: item.customize,
        }));

        const formattedCustomProducts = customProductsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.price
            ? `₦${parseFloat(item.price).toLocaleString()}`
            : "₦0",
          category: item.category || "Customized",
          badge: "Customizable",
          image:
            item.images?.[0]?.url ||
            (item.images?.[0]?.path
              ? `https://api.sablle.ng/storage/${item.images[0].path}`
              : "/placeholder-image.jpg"),
          customize: true,
        }));

        setAllProducts(formattedAllProducts);
        setAllCustomProducts(formattedCustomProducts);

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
        setAllCustomProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Run once on mount

  // Client-side filtering for All / Non-Customizable
  const filteredProducts =
    filter === "Customizable"
      ? allCustomProducts
      : allProducts.filter((product) => {
          if (filter === "All") return true;
          if (filter === "Non-Customizable") return product.customize === false;
          return true;
        });

  // Client-side pagination slice
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );
  const displayTotalPages =
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filteredProducts change
  }, [filteredProducts.length]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= displayTotalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

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
                onClick={() => {
                  setFilter(option);
                  setCurrentPage(1); // Reset to page 1 on filter change
                }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                      <h3 className="font-medium line-clamp-2 text-gray-900 text-sm">
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

        {displayTotalPages > 1 && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <div className="text-gray-600">
              Page {currentPage} of {displayTotalPages}
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
                Previous
              </button>

              {[...Array(displayTotalPages).keys()]
                .filter((page) =>
                  displayTotalPages <= 10
                    ? true
                    : page + 1 === 1 ||
                      page + 1 === displayTotalPages ||
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
                disabled={currentPage === displayTotalPages}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === displayTotalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Next page"
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
