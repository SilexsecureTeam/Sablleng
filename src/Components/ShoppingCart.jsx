import React, { useContext, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { CartContext } from "../context/CartContextObject";

export default function ShoppingCart() {
  const { items, updateQuantity, removeItem } = useContext(CartContext);
  const [promoCode, setPromoCode] = useState("");
  const [bonusCard, setBonusCard] = useState("");

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}`;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Placeholder images for different items
  const getItemImage = (index) => {
    const colors = ["bg-gray-200", "bg-gray-800", "bg-gray-600"];
    return colors[index] || "bg-gray-200";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-semibold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-6 border-b border-gray-100"
              >
                {/* Product Image */}
                <div
                  className={`w-16 h-16 rounded-lg flex-shrink-0 ${getItemImage(
                    index
                  )} flex items-center justify-center`}
                >
                  {index === 0 && (
                    <div className="w-10 h-8 bg-white rounded opacity-80"></div>
                  )}
                  {index === 1 && (
                    <div className="w-8 h-10 bg-gray-600 rounded-full"></div>
                  )}
                  {index === 2 && (
                    <div className="w-8 h-10 bg-gray-400 rounded-full"></div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} className="text-gray-600" />
                  </button>

                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} className="text-gray-600" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right min-w-20">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            {/* Discount Code */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Discount code / Promo code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Bonus Card */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                Your bonus card number
              </label>
              <input
                type="text"
                value={bonusCard}
                onChange={(e) => setBonusCard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-lg">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Delivery Note */}
            <p className="text-sm text-gray-500 mb-6">
              Delivery fees not included yet.
            </p>

            {/* Checkout Button */}
            <button className="w-full bg-red-400 text-white py-3 px-4 rounded-md font-medium hover:bg-red-500 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
