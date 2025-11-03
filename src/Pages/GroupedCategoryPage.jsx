import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSubCategories } from "../utils/categoryGroups";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Noti from "../Components/Noti";

const GroupedCategoryPage = () => {
  const { mainSlug } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let cachedCategories = localStorage.getItem("categories");
        let formattedCategories = [];

        if (cachedCategories) {
          formattedCategories = JSON.parse(cachedCategories);
        } else {
          const response = await fetch("https://api.sablle.ng/api/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch categories: ${response.statusText}`
            );
          }

          const data = await response.json();
          const categoriesArray = Array.isArray(data) ? data : [];

          formattedCategories = categoriesArray
            .filter((item) => item.is_active === 1)
            .map((item) => ({
              id: item.id,
              name: item.name,
              slug: item.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, ""),
            }));

          localStorage.setItem(
            "categories",
            JSON.stringify(formattedCategories)
          );
        }

        const subs = getSubCategories(mainSlug, formattedCategories);
        setSubCategories(subs);

        if (subs.length > 0) {
          toast.success(`Loaded ${subs.length} subcategories!`, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.info("No subcategories found—check back soon!", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCategories();
  }, [mainSlug]);

  const mainTitle = mainSlug
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          Loading subcategories...
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Noti />
      <Header />
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center text-sm font-medium text-[#5F1327] hover:text-gray-700"
          >
            ← Back
          </button>
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#5F1327] mb-4">
              {mainTitle} Collections
            </h2>
            <p className="text-gray-600">
              Discover our curated subcategories below.
            </p>
          </div>

          {/* Subcategory Grid */}
          {error ? (
            <div className="text-center text-red-500 mb-12">{error}</div>
          ) : subCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/categories/${sub.slug}`}
                  className="group overflow-hidden duration-300 block"
                >
                  <div className="h-48 md:h-52 lg:h-56 overflow-hidden rounded-xl flex items-center justify-center bg-[#F4F2F2]">
                    <img
                      src="/placeholder-image.jpg"
                      alt={sub.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm md:text-base font-light text-[#333333] mt-2 hover:text-[#5F1327] transition-colors duration-300">
                      {sub.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 mb-12">
              No subcategories available yet.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GroupedCategoryPage;
