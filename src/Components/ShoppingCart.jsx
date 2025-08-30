import React, { useContext, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import { useNavigate } from "react-router-dom";

export default function ShoppingCart() {
  const { items, updateQuantity, removeItem } = useContext(CartContext);
  const [promoCode, setPromoCode] = useState("");
  const [bonusCard, setBonusCard] = useState("");
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `₦${(price / 1000).toFixed(2)}`;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 sm:gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4 sm:space-y-6 max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-gray-600 text-center">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start sm:items-center space-x-4 sm:space-x-10 pb-4 sm:pb-6 border-b border-gray-100"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-grow flex-col md:flex-row md:items-center">
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                      {item.name}
                      {item.customized && (
                        <span className="ml-2 inline-block bg-[#CB5B6A] text-white text-xs px-2 py-1 rounded">
                          Customized
                        </span>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Model: {item.model}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={14} className="text-gray-600" />
                    </button>
                    <div className="text-right min-w-[80px] sm:min-w-[100px]">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
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
              <span className="font-medium text-sm sm:text-base">Subtotal</span>
              <span className="font-semibold text-base sm:text-lg">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Delivery fees not included yet.
            </p>
            <button
              onClick={() => navigate("/delivery")}
              className="w-full bg-[#CB5B6A] text-white py-2 sm:py-3 px-4 rounded-md font-medium text-sm sm:text-base hover:bg-[#CB5B6A]/70 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
