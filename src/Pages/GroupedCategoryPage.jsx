// Updated GroupedCategoryPage.jsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTagCategories } from "../utils/categoryGroups";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Noti from "../Components/Noti";
import { useTags } from "../context/TagContext";
import { Image as ImageIcon } from "lucide-react";

const GroupedCategoryPage = () => {
  const { mainSlug } = useParams();
  const navigate = useNavigate();

  const { tags, isLoading, error } = useTags();

  const matchedTag = tags.find((tag) => tag.slug === mainSlug);
  const subCategories = matchedTag ? getTagCategories(matchedTag) : [];
  const tagName = matchedTag?.name || "Collection";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      {/* <ToastContainer /> */}
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
              {tagName} Collections
            </h2>
            <p className="text-gray-600">
              Discover our curated categories below.
            </p>
          </div>

          {/* Category Grid */}
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
                  <div className="h-48 md:h-52 lg:h-56 overflow-hidden rounded-t-xl flex items-center justify-center bg-[#F4F2F2]">
                    {sub.image ? (
                      <img
                        src={`https://api.sablle.ng/storage/${sub.image}`}
                        alt={sub.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.warn(
                            `Image failed to load for ${sub.name}:`,
                            e.target.src
                          );
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-full h-full text-gray-400" />
                      </div>
                    )}
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
              No categories available yet.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GroupedCategoryPage;
