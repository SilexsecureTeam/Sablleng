// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAllProducts from "../hooks/useAllProducts";
import ProductFilters from "../Components/ProductFilters";
import { Heart } from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import { useContext } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Noti from "../Components/Noti";

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const { products } = useAllProducts();
  const [rawResults, setRawResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 30;
  const { addToWishlist, isInWishlist } = useContext(CartContext);

  // Initial search from global products
  useEffect(() => {
    if (!query.trim()) {
      setRawResults([]);
      setFilteredResults([]);
      return;
    }

    const matched = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    setRawResults(matched);
    setFilteredResults(matched);
  }, [query, products]);

  // Pagination
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginated = filteredResults.slice(
    startIndex,
    startIndex + productsPerPage
  );
  const totalPages = Math.ceil(filteredResults.length / productsPerPage);

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
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Search for "{query}" ({filteredResults.length} results)
          </h1>

          <div className="flex gap-8">
            <ProductFilters
              products={rawResults}
              onFiltered={setFilteredResults}
            />

            <div className="flex-1">
              {filteredResults.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                  No results for "{query}". Try another search.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {paginated.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="block relative"
                        >
                          <div className="relative bg-[#F4F2F2] p-4 h-64 flex items-center justify-center">
                            {product.badge && (
                              <span className="absolute top-4 left-0 bg-[#5F1327] text-white px-6 py-1.5 rounded-r-full text-xs font-medium z-10">
                                {product.badge}
                              </span>
                            )}
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
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
                          <p className="text-sm text-[#5F1327] mt-1">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded bg-gray-100 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          totalPages <= 7 ||
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
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
                        if (Math.abs(page - currentPage) === 2)
                          return <span key={page}>...</span>;
                        return null;
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded bg-gray-100 disabled:opacity-50"
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

export default SearchResultsPage;
