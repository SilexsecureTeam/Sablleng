// src/Components/RelatedProducts.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!categoryId || !currentProductId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(
          `https://api.sablle.ng/api/categories/${categoryId}`
        );

        if (!res.ok) {
          console.error(
            "❌ Failed to fetch category products — status:",
            res.status
          );
          setRelatedProducts([]);
          return;
        }

        const catData = await res.json();

        const catProducts = Array.isArray(catData.products)
          ? catData.products
          : [];

        const related = catProducts
          .filter((p) => {
            const match = p.id !== currentProductId;
            return match;
          })
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            name: p.name || "Unnamed Product",
            price: p.sale_price_inc_tax
              ? `₦${parseFloat(p.sale_price_inc_tax).toLocaleString()}`
              : "Price Unavailable",
            badge: p.customize ? "Customizable" : null,
            image:
              p.images?.[0]?.url ||
              (p.images?.[0]?.path
                ? `https://api.sablle.ng/storage/${p.images[0].path}`
                : "/placeholder-image.jpg"),
          }));

        setRelatedProducts(related);
      } catch (err) {
        console.error("🚨 Error fetching related products:", err);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, currentProductId]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Products
          </h2>
          {!isLoading && relatedProducts.length > 4 && (
            <div className="flex space-x-2">
              <button
                onClick={scrollLeft}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                ←
              </button>
              <button
                onClick={scrollRight}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                →
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading related products...
          </div>
        ) : relatedProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No related products found in this category
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6 pb-4"
          >
            {relatedProducts.map((p) => (
              <div key={p.id} className="flex-none w-64 snap-start">
                <Link
                  to={`/product/${p.id}`}
                  className="block hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
                >
                  <div className="relative bg-[#F4F2F2] p-4 h-48 flex items-center justify-center">
                    {p.badge && (
                      <div className="absolute top-6 left-0 bg-[#5F1327] text-white px-8 py-2 rounded text-sm font-medium">
                        {p.badge}
                      </div>
                    )}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                    />
                  </div>
                  <div className="py-4 px-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {p.name}
                    </h3>
                    <span className="text-lg font-semibold text-gray-900 block mt-1">
                      {p.price}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
