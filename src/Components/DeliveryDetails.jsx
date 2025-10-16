import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryDetail = () => {
  const { auth } = useContext(AuthContext);
  const { items, total } = useContext(CartContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: "Abuja, Wuse 2",
    delivery_fee: 200,
    tax_rate: 7.5,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shipping_address.trim())
      newErrors.shipping_address = "Shipping address is required";
    if (!formData.delivery_fee || formData.delivery_fee < 0)
      newErrors.delivery_fee = "Delivery fee must be a valid number";
    if (!formData.tax_rate || formData.tax_rate < 0)
      newErrors.tax_rate = "Tax rate must be a valid number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!auth?.isAuthenticated || !auth?.token) {
      toast.error("You must be logged in to checkout");
      navigate("/signin");
      return;
    }

    setIsLoading(true);

    try {
      // FIX: The checkout API likely doesn't need the cart items sent in the payload.
      // It should securely fetch the cart from the server using your authentication token.
      // We only need to send the delivery details it doesn't know about.
      const payload = {
        shipping_address: formData.shipping_address,
        delivery_fee: parseFloat(formData.delivery_fee),
        tax_rate: parseFloat(formData.tax_rate),
      };

      console.log(
        "Submitting checkout with payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch("https://api.sablle.ng/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(
        "DeliveryDetail: POST /api/checkout response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        toast.success("Checkout submitted! Proceeding to payment.");
        navigate("/payment", {
          state: {
            selectedDelivery: {
              value: parseFloat(formData.delivery_fee),
              shipping_address: formData.shipping_address,
              tax_rate: parseFloat(formData.tax_rate),
              orderData: data.data, // Pass order data to payment page if needed
            },
          },
        });
      } else {
        console.error("DeliveryDetail: Checkout error:", data.message);
        toast.error(
          data.message || "Failed to process checkout. Your cart may be empty."
        );
        setErrors({
          ...errors,
          api: data.message || "An error occurred during checkout.",
        });
      }
    } catch (error) {
      console.error("DeliveryDetail: Network error:", error.message);
      toast.error("Network error. Please check your connection and try again.");
      setErrors({
        ...errors,
        api: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "₦--";
    return `₦${numericPrice.toLocaleString()}`;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        Delivery Details
      </h1>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 sm:gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.api && (
              <p className="text-red-500 text-sm mb-4">{errors.api}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Shipping Address
              </label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="Enter your shipping address"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                required
                disabled={isLoading}
              />
              {errors.shipping_address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.shipping_address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Delivery Fee (₦)
              </label>
              <input
                type="number"
                name="delivery_fee"
                value={formData.delivery_fee}
                onChange={handleChange}
                placeholder="Enter delivery fee"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                min="0"
                step="0.01"
                required
                disabled={isLoading}
              />
              {errors.delivery_fee && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.delivery_fee}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                placeholder="Enter tax rate"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                min="0"
                step="0.01"
                required
                disabled={isLoading}
              />
              {errors.tax_rate && (
                <p className="text-red-500 text-sm mt-1">{errors.tax_rate}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-[#CB5B6A] text-white py-3 px-4 rounded-md font-medium text-base hover:bg-[#CB5B6A]/70 transition-colors disabled:bg-[#CB5B6A]/50"
              disabled={isLoading || items.length === 0}
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
        <div className="lg:w-80 xl:w-96">
          <div className="border-gray-200 border rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              Order Summary
            </h2>
            {items.length === 0 ? (
              <p className="text-gray-600 text-sm">Your cart is empty.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {/* FIX: Access item.name directly */}
                      {item.name || "Unknown Product"} x {item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      {/* FIX: Correctly format price without dividing */}
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="font-medium text-sm sm:text-base">Subtotal</span>
              <span className="font-semibold text-base sm:text-lg">
                {/* FIX: Correctly format total without dividing */}
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Delivery fees and taxes calculated upon checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;
