import React, { useState } from "react";
import {
  CreditCard,
  Send,
  Building2,
  DollarSign,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import i1 from "../assets/i1.png";

const PaymentForm = ({ total, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("NGN", "₦");

  const handleSubmit = () => {
    // Card number validation (basic: not empty and at least 12 digits)
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 12) {
      setError("Please enter a valid card number (minimum 12 digits)");
      return;
    }

    // Expiry validation (MM/YY format, e.g., 12/25)
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    if (!expiry || !expiryRegex.test(expiry)) {
      setError("Please enter a valid expiry date (MM/YY, e.g., 12/25)");
      return;
    }

    // Validate expiry date is not in the past
    const [month, year] = expiry.split("/").map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Last two digits
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError("Card expiry date cannot be in the past");
      return;
    }

    // CVV validation (3-4 digits)
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      setError("Please enter a valid CVV (3 or 4 digits)");
      return;
    }

    setError("");
    // Simulate Paystack payment processing
    alert("Processing payment via Paystack...");
    onSuccess(); // Navigate to OrderSuccess
  };

  // Handle card number formatting (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    value = value.slice(0, 16); // Limit to 16 digits
    value = value.replace(/(.{4})/g, "$1 ").trim(); // Add space every 4 digits
    setCardNumber(value);
  };

  // Handle expiry formatting (auto-inserts slash, e.g., 12/25)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    value = value.slice(0, 4); // Limit to 4 digits (MMYY)
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
      {/* Payment Methods Sidebar */}
      <div className="px-4 py-4 bg-gray-50 w-full md:w-2/5">
        <h2 className="text-lg font-medium text-gray-900 pb-5">PAY WITH</h2>
        <div className="space-y-3 w-full border-t border-t-gray-200">
          <div className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Card</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-green-600 transform rotate-180" />
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
            <Send className="w-5 h-5" />
            <span>Transfer</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
            <Building2 className="w-5 h-5" />
            <span>Bank</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
            <DollarSign className="w-5 h-5" />
            <span>USSD</span>
          </div>
        </div>
      </div>

      {/* Card Details Form */}
      <div className="px-4 py-6 sm:px-6 bg-white w-full md:w-3/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <img src={i1} alt="Payment Method" className="w-6 h-6 mb-2 sm:mb-0" />
          <div className="text-center sm:text-right">
            <span className="text-base text-gray-600">Pay </span>
            <span className="text-base font-semibold text-green-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        <h3 className="text-center text-gray-700 font-medium mb-6">
          Enter your card details to pay
        </h3>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              CARD NUMBER
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                CARD EXPIRY
              </label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="MM/YY"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  CVV
                </label>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="123"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-sm sm:text-base"
        >
          Pay {formatCurrency(total)}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
