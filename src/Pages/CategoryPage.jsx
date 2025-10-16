import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productResponse = await fetch(
          "https://api.sablle.ng/api/products",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
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

        const formattedProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "",
          category: item.category?.name || "",
          badge: item.is_variable_price ? "Customizable" : null,
          image: item.images?.[0] || "/placeholder-image.jpg",
        }));

        setProducts(formattedProducts);

        // Fetch categories
        const categoryResponse = await fetch(
          "https://api.sablle.ng/api/categories",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoryResponse.statusText}`
          );
        }

        const categoryData = await categoryResponse.json();
        const categoriesArray = Array.isArray(categoryData) ? categoryData : [];

        setCategories(
          categoriesArray.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, "-"),
          }))
        );

        toast.success("Data fetched successfully!", {
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
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map slug to category name
  const category = categories.find((cat) => cat.slug === categorySlug);
  const categoryName = category ? category.name : "Unknown Category";

  const filteredProducts = products
    .filter((product) => product.category === categoryName)
    .filter((product) => {
      if (filter === "All") return true;
      if (filter === "Customizable") return product.badge === "Customizable";
      if (filter === "Non-Customizable") return product.badge === null;
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
