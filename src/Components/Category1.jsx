import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Keep your placeholder images (we'll map them manually for now)
import cat1 from "../assets/cat1.png";
import cat2 from "../assets/cat2.png";
import cat3 from "../assets/cat3.png";
import cat4 from "../assets/cat4.png";
import cat5 from "../assets/cat5.png";
import cat6 from "../assets/cat6.png";
import cat7 from "../assets/cat7.png";
import cat8 from "../assets/cat8.png";

// Manual mapping: tag.slug → image (temporary until API supports images)
const tagImageMap = {
  christmas: cat1,
  hampers: cat2,
  corporate: cat3,
  "exclusive-at-sabblle": cat4,
  "for-him": cat5,
  "for-her": cat6,
  birthday: cat7,
  confectionery: cat8,
  // Add more as needed, fallback below
};

const fallbackImage = cat1; // or a default one

export default function Category1() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const CACHE_KEY = "sablle_homepage_tags";
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      const now = new Date().getTime();

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (now - timestamp < CACHE_EXPIRY) {
          setTags(data);
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch("https://api.sablle.ng/api/tags", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.statusText}`);
        }

        const tagsData = await response.json();
        const tagsArray = Array.isArray(tagsData) ? tagsData : [];

        const activeTags = tagsArray
          .filter((tag) => tag.is_active === true)
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // optional: sort alphabetically

        // Cache it
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: activeTags, timestamp: now })
        );

        setTags(activeTags);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load collections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Helper to get image
  const getTagImage = (slug) => {
    return tagImageMap[slug] || fallbackImage;
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#5F1327] mb-4">
            Explore Our Collections
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 md:h-52 lg:h-56 bg-gray-200 rounded-xl"></div>
                <div className="p-4 text-center">
                  <div className="h-4 bg-gray-200 rounded mt-2 w-32 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-10 text-red-600">{error}</div>
        )}

        {/* Tags Grid */}
        {!isLoading && !error && tags.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/groups/${tag.slug}`}
                className="group overflow-hidden duration-300 block"
              >
                <div className="h-48 md:h-52 lg:h-56 overflow-hidden">
                  <img
                    src={getTagImage(tag.slug)}
                    alt={tag.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm md:text-base font-light text-[#333333] mt-2 hover:text-[#5F1327] transition-colors duration-300">
                    {tag.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Tags */}
        {!isLoading && !error && tags.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No collections available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
