import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Heart, Trash2 } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(CartContext);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from context (already synced with localStorage)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="py-12 md:py-16 min-h-screen bg-[#FFF2F2]">
      {/* <ToastContainer /> */}
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart size={28} className="text-[#5F1327]" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist
            </p>
            <Link
              to="/product"
              className="inline-block bg-[#5F1327] text-white px-6 py-3 rounded-md hover:bg-[#b34f5c] transition-colors duration-200"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200 animate-fade-in"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="block relative"
                  aria-label={`View details for ${product.name}`}
                >
                  <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                    {product.badge && (
                      <div className="absolute top-6 left-0 bg-[#5F1327] text-white px-8 py-2 rounded text-sm font-medium">
                        {product.badge}
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-[#5F1327] py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
