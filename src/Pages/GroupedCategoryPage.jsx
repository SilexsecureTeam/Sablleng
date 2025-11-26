// Updated GroupedCategoryPage.jsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { getTagCategories } from "../utils/categoryGroups";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Noti from "../Components/Noti";
import { useTags } from "../context/TagContext";

const GroupedCategoryPage = () => {
  const { mainSlug } = useParams();
  const navigate = useNavigate();

  const { tags, isLoading, error } = useTags();

  const matchedTag = tags.find((tag) => tag.slug === mainSlug);
  const subCategories = matchedTag ? getTagCategories(matchedTag) : [];
  const tagName = matchedTag?.name || "Collection";

  // useEffect(() => {
  //   const CACHE_KEY = "sablle_tags";
  //   // const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  //   const CACHE_EXPIRY = 30 * 1000; // 30 seconds

  //   const fetchTags = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       // Check cache first
  //       const cached = localStorage.getItem(CACHE_KEY);
  //       const now = new Date().getTime();
  //       let formattedTags = [];

  //       if (cached) {
  //         const { data, timestamp } = JSON.parse(cached);
  //         if (now - timestamp < CACHE_EXPIRY) {
  //           formattedTags = data;
  //         } else {
  //           // Cache expired, fetch fresh
  //           const response = await fetch("https://api.sablle.ng/api/tags", {
  //             method: "GET",
  //             headers: { "Content-Type": "application/json" },
  //           });

  //           if (!response.ok) {
  //             throw new Error(`Failed to fetch tags: ${response.statusText}`);
  //           }

  //           const data = await response.json();
  //           formattedTags = Array.isArray(data)
  //             ? data.filter((item) => item.is_active === true)
  //             : [];

  //           // Cache fresh data
  //           localStorage.setItem(
  //             CACHE_KEY,
  //             JSON.stringify({
  //               data: formattedTags,
  //               timestamp: now,
  //             })
  //           );
  //         }
  //       } else {
  //         // No cache, fetch
  //         const response = await fetch("https://api.sablle.ng/api/tags", {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //         });

  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch tags: ${response.statusText}`);
  //         }

  //         const data = await response.json();
  //         formattedTags = Array.isArray(data)
  //           ? data.filter((item) => item.is_active === true)
  //           : [];

  //         // Cache it
  //         localStorage.setItem(
  //           CACHE_KEY,
  //           JSON.stringify({
  //             data: formattedTags,
  //             timestamp: now,
  //           })
  //         );
  //       }

  //       setTags(formattedTags);

  //       // Find the tag matching the slug
  //       const matchedTag = formattedTags.find((tag) => tag.slug === mainSlug);

  //       if (matchedTag) {
  //         setTagName(matchedTag.name);
  //         const subs = getTagCategories(matchedTag);
  //         setSubCategories(subs);

  //         if (subs.length > 0) {
  //           // toast.success(`Loaded ${subs.length} categories!`, {
  //           //   position: "top-right",
  //           //   autoClose: 3000,
  //           // });
  //         } else {
  //           // toast.info("No categories found—check back soon!", {
  //           //   position: "top-right",
  //           //   autoClose: 5000,
  //           // });
  //         }
  //       } else {
  //         throw new Error("Tag not found");
  //       }
  //     } catch (err) {
  //       console.error("Fetch tags error:", err);
  //       setError(err.message);
  //       // toast.error(`Error: ${err.message}`, {
  //       //   position: "top-right",
  //       //   autoClose: 5000,
  //       // });
  //       setSubCategories([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchTags();
  // }, [mainSlug]);

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
