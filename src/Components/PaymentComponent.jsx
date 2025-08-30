import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContextObject";
import { useNavigate } from "react-router-dom";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";

const PaymentComponent = () => {
  const { items } = useContext(CartContext);
  const [selectedPayment, setSelectedPayment] = useState("paystack");
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: "paystack",
      icon: i1, // Use i1.png for Paystack
      title: "Paystack",
      description: "Pay securely with card or bank transfer",
    },
    {
      id: "cod",
      icon: i2, // Use i2.png for Cash on Delivery
      title: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
  ];

  // Calculate order summary
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const vat = subtotal * 0.075; // 7.5% VAT
  const delivery = 6000; // Example: Use selected delivery from DeliveryDetails (hardcoded for now)
  const total = subtotal + vat + delivery;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("NGN", "₦");
  };

  const handlePayment = () => {
    if (selectedPayment === "paystack") {
      alert("Redirecting to Paystack payment gateway...");
      // Add Paystack integration here
    } else {
      alert("Order placed! You will pay cash on delivery.");
      // Reset cart or navigate to order confirmation
      navigate("/");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-20">
        {/* Payment Methods Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment
            </h2>
            <p className="text-sm text-gray-600">
              Choose a method and complete payment securely.
            </p>
          </div>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPayment === method.id
                    ? "border-[#CB5B6A] bg-[#CB5B6A]/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="text-[#CB5B6A] focus:ring-[#CB5B6A]"
                />
                {method.id === "paystack" ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedPayment === method.id
                          ? "bg-[#CB5B6A]/20"
                          : "bg-gray-100"
                      }`}
                    >
                      <img
                        src={method.icon}
                        alt={method.title}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {method.title}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedPayment === method.id
                          ? "bg-[#CB5B6A]/20"
                          : "bg-gray-100"
                      }`}
                    >
                      <img
                        src={method.icon}
                        alt={method.title}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {method.title}
                      </h4>
                      {method.description && (
                        <p className="text-sm text-gray-500">
                          {method.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="space-y-6 border border-gray-200 rounded-lg p-8">
          <div className=" space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">₦0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">VAT (7.5%)</span>
                <span className="font-medium">{formatCurrency(vat)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">{formatCurrency(delivery)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handlePayment}
            className="w-full bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Complete Payment
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;
