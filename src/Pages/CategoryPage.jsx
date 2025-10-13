// src/Pages/CategoryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Footer from "../Components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryPage = () => {
  const { categorySlug } = useParams(); // Get category slug from URL
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  // Helper function to create a slug from category name
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  // Fetch categories and products
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/categories", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Categories fetch error:", err);
        setError(err.message);
        toast.error(`Error fetching categories: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        const productsArray = Array.isArray(data.data) ? data.data : [];
        setProducts(productsArray);
      } catch (err) {
        console.error("Products fetch error:", err);
        setError(err.message);
        toast.error(`Error fetching products: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  // Find the category based on the slug
  const category = categories.find(
    (cat) => createSlug(cat.name) === categorySlug
  );
  const categoryName = category ? category.name : "Unknown Category";
  const categoryId = category ? category.id : null;

  // Filter products by category ID
  const filteredProducts = products.filter(
    (product) => product.category_id === categoryId
  );

  // Apply additional filtering (All, Customizable, Non-Customizable)
  const displayedProducts = filteredProducts.filter((product) => {
    if (filter === "All") return true;
    if (filter === "Customizable") return product.is_variable_price;
    if (filter === "Non-Customizable") return !product.is_variable_price;
    return true;
  });

  return (
    <div>
      <ToastContainer />
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200 animate-fade-in"
                  >
                    <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                      {product.is_variable_price && (
                        <div className="absolute top-6 left-0 bg-[#CB5B6A] text-white px-8 py-2 rounded text-sm font-medium">
                          Customizable
                        </div>
                      )}
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].url
                            : "https://via.placeholder.com/150"
                        }
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h3>
                      <span className="text-lg font-semibold text-gray-900">
                        N
                        {parseFloat(
                          product.sale_price_inc_tax
                        ).toLocaleString()}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#CB5B6A] py-1 rounded">
                          {categoryName}
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
