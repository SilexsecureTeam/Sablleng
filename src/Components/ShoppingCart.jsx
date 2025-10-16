import React, { useContext, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ShoppingCart() {
  const { items, total, updateQuantity, removeItem } = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const [promoCode, setPromoCode] = useState("");
  const [bonusCard, setBonusCard] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("ShoppingCart: Items state:", JSON.stringify(items, null, 2));
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [items]);

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return "₦--";
    }
    return `₦${numericPrice.toLocaleString()}`;
  };

  const handleRemoveItem = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      removeItem(id);
      toast.success("Item removed from cart!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleCheckout = () => {
    if (!authContext?.auth?.isAuthenticated) {
      toast.error("Please log in to continue with checkout", {
        position: "top-right",
        autoClose: 3000,
      });
      // navigate("/signin");
      return;
    }
    navigate("/delivery");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <ToastContainer />
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        Shopping Cart
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB5B6A]"></div>
            <p className="mt-2 text-gray-600">Loading cart...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 sm:gap-8">
          <div className="flex-1 space-y-4 sm:space-y-6 max-h-[420px] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <p className="text-gray-600 text-center py-10">
                Your cart is empty.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start sm:items-center space-x-4 sm:space-x-10 pb-4 sm:pb-6 border-b border-gray-100"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-50">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name || "Product"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-grow flex-col md:flex-row md:items-center">
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        {item.name || "Unknown Product"}
                        {item.customization_id && (
                          <span className="ml-2 inline-block bg-[#CB5B6A] text-white text-xs px-2 py-1 rounded">
                            Customized
                          </span>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Color: {item.color || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Minus size={14} className="text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} className="text-gray-600" />
                      </button>
                      <div className="text-right min-w-[80px] sm:min-w-[100px]">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveItem(e, item.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:w-80 xl:w-96">
            <div className="border-gray-200 border rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-600 mb-2">
                  Discount code / Promo code
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Code"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-[#CB5B6A]"
                />
              </div>
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm text-gray-600 mb-2">
                  Your bonus card number
                </label>
                <input
                  type="text"
                  value={bonusCard}
                  onChange={(e) => setBonusCard(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-[#CB5B6A]"
                />
              </div>
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <span className="font-medium text-sm sm:text-base">
                  Subtotal
                </span>
                <span className="font-semibold text-base sm:text-lg">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Delivery fees not included yet.
              </p>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#CB5B6A] text-white py-2 sm:py-3 px-4 rounded-md font-medium text-sm sm:text-base hover:bg-[#CB5B6A]/70 transition-colors disabled:opacity-50"
                disabled={items.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
