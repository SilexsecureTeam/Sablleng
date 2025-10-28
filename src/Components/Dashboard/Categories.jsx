import React, { useState, useEffect, useContext } from "react";
import { Bell, Settings, Zap } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and product counts from API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!auth.token) {
        toast.error("Please verify OTP to continue.", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate("/admin/otp"), 2000);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories
        const response = await fetch("https://api.sablle.ng/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(
          "GET /api/categories response:",
          JSON.stringify(data, null, 2)
        );

        // Handle potential nested data (e.g., { data: [...] })
        const categoriesArray = Array.isArray(data.data) ? data.data : data;

        // Fetch cached product counts
        const cachedCounts = JSON.parse(
          localStorage.getItem("category_product_counts") || "{}"
        );
        const currentTime = Date.now();
        const cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds

        // Fetch product counts for each category
        const formattedCategories = await Promise.all(
          categoriesArray.map(async (item) => {
            // Check cache
            const cached = cachedCounts[item.id];
            if (cached && currentTime - cached.timestamp < cacheTTL) {
              return {
                id: item.id,
                name: item.name,
                description: item.description || "No description available",
                productCount: cached.productCount,
                status: item.is_active ? "Active" : "Inactive",
              };
            }

            // Fetch product count from GET /api/categories/:id
            let productCount = 0;
            try {
              const productResponse = await fetch(
                `https://api.sablle.ng/api/categories/${item.id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                  },
                }
              );

              if (productResponse.status === 401) {
                throw new Error("Unauthorized. Please log in again.");
              }

              if (!productResponse.ok) {
                console.warn(
                  `Failed to fetch products for category ${item.id}: ${productResponse.statusText}`
                );
                productCount = 0;
              } else {
                const productData = await productResponse.json();
                console.log(
                  `GET /api/categories/${item.id} response:`,
                  JSON.stringify(productData, null, 2)
                );
                productCount = Array.isArray(productData.products)
                  ? productData.products.length
                  : 0;
              }

              // Update cache
              cachedCounts[item.id] = {
                productCount,
                timestamp: currentTime,
              };
              localStorage.setItem(
                "category_product_counts",
                JSON.stringify(cachedCounts)
              );
            } catch (err) {
              console.error(
                `Error fetching products for category ${item.id}:`,
                err
              );
              productCount = 0;
              toast.error(
                `Error fetching product count for ${item.name}: ${err.message}`,
                {
                  position: "top-right",
                  autoClose: 5000,
                }
              );
            }

            return {
              id: item.id,
              name: item.name,
              description: item.description || "No description available",
              productCount,
              status: item.is_active ? "Active" : "Inactive",
            };
          })
        );

        setCategories(formattedCategories);
        toast.success("Categories fetched successfully!", {
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
        setCategories([]);
        if (err.message.includes("Unauthorized")) {
          setTimeout(() => navigate("/admin/signin"), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [auth.token, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer />
      {/* Top Navigation Bar */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#C3B7B9] text-gray-700 rounded-md hover:bg-[#C3B7B9]/80 cursor-pointer transition-colors text-sm font-medium">
          <Zap className="w-4 h-4" />
          Quick Action
        </button>
        <button className="relative p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[#414245] mb-6">
          Products Category
        </h1>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No categories found.</p>
          </div>
        ) : (
          /* Category Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white"
              >
                {/* Active Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#EAFFD8] text-[#1B8401] text-xs font-medium rounded">
                    {category.status}
                  </span>
                </div>

                {/* Category Content */}
                <div className="pr-16">
                  <h2 className="text-base font-semibold text-[#414245] mb-1">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[#414245] mb-4">
                    {category.description}
                  </p>
                  <p className="text-sm font-medium text-[#414245]">
                    {category.productCount} products
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
