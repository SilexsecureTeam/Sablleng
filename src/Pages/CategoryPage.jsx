import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Footer from "../Components/Footer";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [filter, setFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current display page
  const [totalPages, setTotalPages] = useState(1); // Track total display pages
  const [maxPagesFetched, setMaxPagesFetched] = useState(5); // Limit initial fetch to 5 pages
  const [totalApiPages, setTotalApiPages] = useState(1); // Track total API pages
  const productsPerPage = 10; // Match API's per-page limit

  // Fetch categories once for slug-to-ID mapping
  useEffect(() => {
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

        setCategories(
          categoriesArray
            .filter((item) => item.is_active === 1) // Only active categories
            .map((item) => ({
              id: item.id,
              name: item.name,
              slug: item.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, ""), // Match Header's slug logic
            }))
        );
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

  // Memoize category ID and name to stabilize dependencies
  const { categoryId, categoryName } = useMemo(() => {
    const category =
      categories.find((cat) => cat.slug === categorySlug) || null;
    return {
      categoryId: category ? category.id : null,
      categoryName: category ? category.name : "Unknown Category",
    };
  }, [categorySlug, categories]);

  // Fetch products and filter client-side by categoryId
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

      if (isMounted) {
        setIsLoading(true);
        setError(null);
        setProducts([]);
      }

      try {
        let allProducts = [];
        let page = 1;
        let lastPage = 1;

        do {
          const productResponse = await fetch(
            `https://api.sablle.ng/api/products?page=${page}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal, // Allow canceling fetch
            }
          );

          if (!productResponse.ok) {
            throw new Error(
              `Failed to fetch products: ${productResponse.statusText}`
            );
          }

          const productData = await productResponse.json();
          const productsArray = Array.isArray(productData.data)
            ? productData.data
            : [];

          // Filter products client-side by categoryId
          const formattedProducts = productsArray
            .filter((item) => item.category_id === categoryId)
            .map((item) => ({
              id: item.id,
              name: item.name || "",
              price: item.sale_price_inc_tax
                ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
                : "",
              category: item.category?.name || categoryName, // Fallback to categoryName
              badge: item.customize ? "Customizable" : null, // Use customize field
              image: item.images?.[0] || "/placeholder-image.jpg",
            }));

          allProducts = [...allProducts, ...formattedProducts];
          lastPage = productData.last_page || 1;
          page += 1;
        } while (page <= Math.min(lastPage, maxPagesFetched));

        if (isMounted) {
          setProducts(allProducts);
          setTotalApiPages(lastPage); // Store total API pages
          setTotalPages(Math.ceil(allProducts.length / productsPerPage));
          setCurrentPage(1);

          if (allProducts.length > 0) {
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
        if (err.name === "AbortError") return; // Ignore abort errors
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
        if (isMounted) setIsLoading(false);
      }
    };

    if (categorySlug && categories.length > 0) {
      fetchData();
    }

    return () => {
      isMounted = false;
      controller.abort(); // Cancel fetches on unmount
    };
  }, [categorySlug, categoryId, maxPagesFetched]);

  // Handle page change for client-side pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Scroll to top
    }
  };

  // Handle Load More to fetch additional pages
  const handleLoadMore = () => {
    setMaxPagesFetched((prev) => prev + 5); // Fetch 5 more pages
  };

  // Client-side pagination: Slice products for the current page
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // Filter products by selected filter (Customizable/Non-Customizable)
  const filteredProducts = paginatedProducts.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.badge === "Customizable";
    if (filter === "Non-Customizable") return product.badge === null;
    return true;
  });

  // Generate page numbers for pagination (show up to 5 pages around current)
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
      <Phero />
      <div className="py-12 md:py-16">
        <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {categoryName}
          </h2>
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
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200 animate-fade-in"
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
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </h3>
                    <span className="text-lg font-semibold text-gray-900">
                      {product.price}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#CB5B6A] py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                No products found in this category.
              </div>
            )}
          </div>
          {/* Pagination Controls and Load More */}
          {(totalPages > 1 || maxPagesFetched < totalApiPages) && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              {totalPages > 1 && (
                <>
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
                </>
              )}
              {maxPagesFetched < totalApiPages && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#CB5B6A] text-white hover:bg-[#b34f5c]"
                  }`}
                  aria-label="Load more products"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
