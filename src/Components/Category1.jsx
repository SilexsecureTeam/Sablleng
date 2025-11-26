import React from "react";
import { Link } from "react-router-dom";
import { useTags } from "../context/TagContext";

export default function Category1() {
  const { tags, isLoading, error } = useTags();

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
                <div className="h-48 md:h-52 lg:h-56 overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src={tag.image_url}
                    alt={tag.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    // onError={(e) => {
                    //   e.target.src = FALLBACK_IMAGE;
                    // }}
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
