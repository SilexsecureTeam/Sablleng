import React, { useContext, useState } from "react";
import { Check, Download, Printer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";
import jsPDF from "jspdf";

const OrderSuccess = () => {
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, items, subtotal, vat, delivery, total, address } =
    location.state || {};
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
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

  const handleTrackOrder = () => {
    clearCart();
    navigate("/order-tracking", { state: { orderId, address } });
  };

  const generateReceiptPDF = async () => {
    setIsDownloading(true);
    setError("");
    try {
      const element = document.querySelector(".max-w-\\[800px\\]");
      const buttons = element.querySelectorAll("button");
      buttons.forEach((btn) => (btn.style.display = "none"));

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      buttons.forEach((btn) => (btn.style.display = ""));

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Sabilay_Receipt_${orderId || "SABIL-20250829-4194"}.pdf`);
    } catch {
      setError("Failed to generate receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setError("");
    try {
      window.print();
    } catch {
      setError("Failed to initiate print. Please try again.");
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 my-8">
      {/* Success Icon with Animation */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 transform transition-transform hover:scale-110">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
          Order Placed Successfully!
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Thank you for shopping with Sabilay
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
          {error}
        </div>
      )}

      {/* Order Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 p-4 rounded-md">
            <p className="text-sm font-medium text-gray-900">Order ID</p>
            <p className="text-sm text-gray-600">
              {orderId || "SABIL-20250829-4194"}
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-md sm:text-right">
            <p className="text-sm font-medium text-gray-900">Payment</p>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Items</h3>
          <div className="space-y-2">
            {(
              items || [
                {
                  name: "Ultra Aqua skincare set white",
                  quantity: 1,
                  price: 74000,
                },
                {
                  name: "Acmella x 1 cream gel cleansing",
                  quantity: 1,
                  price: 10000,
                },
              ]
            ).map((item) => (
              <div
                key={item.id || item.name}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {item.name} x {item.quantity}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              {formatCurrency(subtotal || 74000)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-gray-900">₦0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (7.5%)</span>
            <span className="text-gray-900">{formatCurrency(vat || 6550)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery</span>
            <span className="text-gray-900">
              {formatCurrency(delivery || 3000)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {formatCurrency(total || 84000)}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Delivery Address
          </h3>
          <div className="text-sm text-gray-600">
            {address ? (
              <>
                <p>{address.name}</p>
                <p>{address.address}</p>
              </>
            ) : (
              <>
                <p>John O. - +2348037358599</p>
                <p>17 Adesola Odeku St, Victoria Island, Lagos</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <button
            onClick={generateReceiptPDF}
            disabled={isDownloading}
            className={`flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
              isDownloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Download order receipt as PDF"
          >
            <Download size={16} />
            {isDownloading ? "Downloading..." : "Download Receipt"}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
              isPrinting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Print order receipt"
          >
            <Printer size={16} />
            {isPrinting ? "Preparing Print..." : "Print Receipt"}
          </button>
          <button
            onClick={handleTrackOrder}
            className="flex-1 py-2 px-4 bg-[#CB5B6A] hover:bg-[#CB5B6A]/80 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            aria-label="Track your order"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            Track My Order
          </button>
        </div>
      </div>

      {/* Print-Specific Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-[800px],
          .max-w-[800px] * {
            visibility: visible;
          }
          .max-w-[800px] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            margin: 0;
            padding: 20px;
          }
          .animate-fade-in,
          .hover\\:scale-110,
          .hover\\:bg-gray-50,
          .transition-colors,
          .transition-transform {
            animation: none !important;
            transform: none !important;
            background: none !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
