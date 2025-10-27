import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Cahero from "../Components/Cahero";
import Footer from "../Components/Footer";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;
  const { addToWishlist, isInWishlist } = useContext(CartContext);

  useEffect(() => {
    const cachedCategories = localStorage.getItem("categories");
    if (cachedCategories) {
      setCategories(JSON.parse(cachedCategories));
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch("https://api.sablle.ng/api/categories", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data = await response.json();
        const categoriesArray = Array.isArray(data) ? data : [];

        const formattedCategories = categoriesArray
          .filter((item) => item.is_active === 1)
          .map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, ""),
          }));

        setCategories(formattedCategories);
        localStorage.setItem("categories", JSON.stringify(formattedCategories));
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError(err.message);
        toast.error(`Error fetching categories: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    fetchCategories();
  }, []);

  const { categoryId, categoryName } = useMemo(() => {
    const category =
      categories.find((cat) => cat.slug === categorySlug) || null;
    return {
      categoryId: category ? category.id : null,
      categoryName: category ? category.name : "Unknown Category",
    };
  }, [categorySlug, categories]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      if (!categoryId) {
        if (isMounted) {
          setError("Category not found");
          setProducts([]);
          setTotalPages(1);
          setIsLoading(false);
        }
        return;
      }

      const cacheKey = `products_${categoryId}`;
      const cachedProducts = localStorage.getItem(cacheKey);
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        if (isMounted) {
          setProducts(parsedProducts);
          setTotalPages(Math.ceil(parsedProducts.length / productsPerPage));
          setCurrentPage(1);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
        setProducts([]);
      }

      try {
        const response = await fetch(
          `https://api.sablle.ng/api/categories/${categoryId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch category products: ${response.statusText}`
          );
        }

        const data = await response.json();
        const productsArray = Array.isArray(data.products) ? data.products : [];

        const formattedProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "Price Unavailable",
          category: item.category?.name || categoryName,
          badge: item.customize ? "Customizable" : null,
          image: item.images?.[0] || "/placeholder-image.jpg",
          customize: item.customize,
        }));

        if (isMounted) {
          setProducts(formattedProducts);
          localStorage.setItem(cacheKey, JSON.stringify(formattedProducts));
          setTotalPages(Math.ceil(formattedProducts.length / productsPerPage));
          setCurrentPage(1);

          if (formattedProducts.length > 0) {
            toast.success("Products fetched successfully!", {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            toast.info("No products found in this category", {
              position: "top-right",
              autoClose: 5000,
            });
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Fetch products error:", err);
        if (isMounted) {
          setError(err.message);
          toast.error(`Error: ${err.message}`, {
            position: "top-right",
            autoClose: 5000,
          });
          setProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (categorySlug && categories.length > 0) {
      fetchData();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [categorySlug, categoryId, categoryName, categories]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const filteredProducts = paginatedProducts.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.customize === true;
    if (filter === "Non-Customizable") return product.customize === false;
    return true;
  });

  const getPageNumbers = () => {
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
    <div>
      <ToastContainer />
      <Noti />
      <Header />
      <Cahero />
      <div className="py-12 md:py-8">
        <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {categoryName}
          </h2>
          <div className="mb-4">
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
                      ? "bg-[#CB5B6A] text-white"
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
                  <Link
                    to={`/product/${product.id}`}
                    className="block relative"
                  >
                    <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                      {product.badge && (
                        <div className="absolute top-6 left-0 bg-[#CB5B6A] text-white px-8 py-2 rounded text-sm font-medium">
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
                              ? "text-[#CB5B6A] fill-[#CB5B6A]"
                              : "text-gray-400"
                          }
                        />
                      </button>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {product.price}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                No products found in this category.
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-[#CB5B6A] hover:text-white"
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === page
                        ? "bg-[#CB5B6A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-[#CB5B6A] hover:text-white"
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
                      : "bg-gray-100 text-gray-700 hover:bg-[#CB5B6A] hover:text-white"
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
