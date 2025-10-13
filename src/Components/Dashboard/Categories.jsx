import React, { useState, useEffect } from "react";
import { Bell, Settings, Zap } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Handle potential nested data (e.g., { data: [...] })
        const categoriesArray = Array.isArray(data.data) ? data.data : data;

        // Map API response to match expected format
        const formattedCategories = categoriesArray.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "No description available",
          productCount: 0, // Placeholder; update if product count API is available
          status: item.is_active ? "Active" : "Inactive",
        }));

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
