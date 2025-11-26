// src/Pages/CategoryPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import ProductFilters from "../Components/ProductFilters"; // ← THE BEAST
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Cahero from "../Components/Cahero";
import Footer from "../Components/Footer";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToWishlist, isInWishlist } = useContext(CartContext);

  // Raw + filtered products
  const [rawProducts, setRawProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 30;

  // Resolve current category
  const { categoryId, categoryName } = useMemo(() => {
    const found = categories.find((c) => c.slug === categorySlug);
    return {
      categoryId: found?.id || null,
      categoryName: found?.name || "Loading...",
    };
  }, [categories, categorySlug]);

  // Fetch categories once
  useEffect(() => {
    const cached = localStorage.getItem("categories");
    if (cached) {
      setCategories(JSON.parse(cached));
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.sablle.ng/api/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();

        const formatted = (Array.isArray(data) ? data : [])
          .filter((c) => c.is_active === 1)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, ""),
          }));

        setCategories(formatted);
        localStorage.setItem("categories", JSON.stringify(formatted));
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products for this category
  useEffect(() => {
    if (!categoryId) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `cat_products_${categoryId}`;
    const cached = localStorage.getItem(cacheKey);
    const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

    if (cached) {
      const { products, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setRawProducts(products);
        setFilteredProducts(products);
        setIsLoading(false);
        return;
      }
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.sablle.ng/api/categories/${categoryId}`
        );
        if (!res.ok) throw new Error("Failed to load products");

        const data = await res.json();
        const productsArray = Array.isArray(data.products) ? data.products : [];

        const formatted = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "Unnamed Product",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "Custom Quote",
          sale_price_inc_tax: parseFloat(item.sale_price_inc_tax) || 0,
          cost_inc_tax: parseFloat(item.cost_inc_tax) || 0,
          customize: !!item.customize,
          customization: item.customization || [],
          created_at: item.created_at,
          category: item.category?.name || categoryName,
          badge: item.customize ? "Customizable" : null,
          image:
            item.images?.[0]?.url ||
            (item.images?.[0]?.path
              ? `https://api.sablle.ng/storage/${item.images[0].path}`
              : "/placeholder-image.jpg"),
        }));

        setRawProducts(formatted);
        setFilteredProducts(formatted);

        // Cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ products: formatted, timestamp: Date.now() })
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, categoryName]);

  // Pagination
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts, currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Noti />
      <Header />
      <Cahero />

      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back + Title */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-medium text-[#5F1327] hover:text-gray-700 inline-flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {categoryName}{" "}
            {filteredProducts.length > 0 &&
              `(${filteredProducts.length} items)`}
          </h1>

          {/* Filters + Product Grid */}
          <div className="flex gap-8">
            {/* REUSABLE FILTERS */}
            <ProductFilters
              products={rawProducts}
              onFiltered={setFilteredProducts}
              isLoading={isLoading}
            />

            {/* Product Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-20 text-gray-600">
                  Loading products...
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                  No products match your filters. Try adjusting them!
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border"
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="block relative"
                        >
                          <div className="relative bg-[#F4F2F2] p-6 h-64 flex items-center justify-center">
                            {product.badge && (
                              <span className="absolute top-4 left-0 bg-[#5F1327] text-white px-6 py-1.5 rounded-r-full text-xs font-bold z-10">
                                {product.badge}
                              </span>
                            )}
                            {product.customization?.length > 0 && (
                              <span className="absolute top-12 left-0 bg-green-600 text-white px-3 py-1 rounded-r-full text-xs font-medium z-10">
                                {product.customization.length}+ customs
                              </span>
                            )}
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                              onError={(e) =>
                                (e.target.src = "/placeholder-image.jpg")
                              }
                            />
                          </div>
                        </Link>

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-[#5F1327] transition">
                                {product.name}
                              </h3>
                            </Link>
                            <button
                              onClick={() => addToWishlist(product)}
                              className="p-2 rounded-full hover:bg-gray-100 transition"
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

                          <p className="text-lg font-bold text-gray-900">
                            {product.price}
                          </p>
                          {product.sale_price_inc_tax > 0 &&
                            product.sale_price_inc_tax <
                              product.cost_inc_tax && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                On Sale!
                              </p>
                            )}
                          <p className="text-xs text-gray-500 mt-1">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages).keys()].map((_, i) => {
                        const page = i + 1;
                        const show =
                          totalPages <= 7 ||
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2;

                        if (!show) {
                          if (Math.abs(page - currentPage) === 3)
                            return (
                              <span key={page} className="px-2">
                                ...
                              </span>
                            );
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2.5 rounded transition ${
                              currentPage === page
                                ? "bg-[#5F1327] text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
