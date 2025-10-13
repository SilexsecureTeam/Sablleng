import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Footer from "../Components/Footer";
import products from "../data/products";

const CategoryPage = () => {
  const { categorySlug } = useParams(); // Get category slug from URL

  // Map slugs to category names
  const categoryMap = {
    "tech-gadgets": "Tech Gadgets",
    audio: "Audio",
    "office-and-writing-tools": "Office and writing tools",
    "bags-and-travel": "Bags and Travel",
    "drink-ware": "Drink ware",
    "home-and-outdoor": "Home and outdoor",
    edibles: "Edibles",
  };

  const categoryName = categoryMap[categorySlug] || "Unknown Category";

  // Filter products by category type
  const filteredProducts = products.filter(
    (product) => product.type === categoryName
  );

  // State for additional filtering (e.g., Customizable, Non-Customizable)
  const [filter, setFilter] = useState("All");

  const displayedProducts = filteredProducts.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.badge === "Customizable";
    if (filter === "Non-Customizable") return product.badge === null;
    return true;
  });

  return (
    <div>
      <Noti />
      <Header />
      <Phero />
      <div className="py-12 md:py-16">
        <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
          {/* Category Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {categoryName}
          </h2>

          {/* Filter Section */}
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

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
