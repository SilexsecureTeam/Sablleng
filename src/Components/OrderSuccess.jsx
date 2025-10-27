import React, { useContext, useState, useEffect } from "react";
import { Check, Download, Printer } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const OrderSuccess = () => {
  const { auth } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();
  const [orderData, setOrderData] = useState(location.state || null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = "https://api.sablle.ng/api";

  // Redirect to /orders if not coming from PaymentComponent or no orderId
  useEffect(() => {
    if (!location.state && !urlOrderId) {
      toast.warn("Please select an order from your order history", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/orders");
    }
  }, [location.state, urlOrderId, navigate]);

  // Check authentication and fetch order details
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      toast.error("Please log in to view your order confirmation", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/signin");
      return;
    }

    const fetchOrderDetails = async () => {
      const orderIdToFetch = urlOrderId || location.state?.orderId;
      if (!orderIdToFetch) {
        setError("No order reference provided.");
        toast.error("No order reference provided. Please select an order.", {
          position: "top-right",
          autoClose: 4000,
        });
        navigate("/orders");
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/${encodeURIComponent(orderIdToFetch)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        const data = await response.json();
        console.log(
          "OrderSuccess: Fetched specific order data:",
          JSON.stringify(data, null, 2)
        );

        if (response.ok && data.order) {
          setOrderData({
            orderId: data.order.order_reference,
            items: data.order.items || [],
            subtotal: parseFloat(data.order.subtotal) || 0,
            vat: parseFloat(data.order.tax_amount) || 0,
            delivery: parseFloat(data.order.delivery_fee) || 0,
            total: parseFloat(data.order.total) || 0,
            address: data.order.shipping_address
              ? {
                  name: auth.user?.name || "Customer",
                  address: data.order.shipping_address,
                }
              : null,
            paymentMethod: data.order.payment_method || "Unknown",
            discount_amount: parseFloat(data.order.discount_amount) || 0,
            tax_rate: parseFloat(data.order.tax_rate) || 0,
          });
        } else {
          throw new Error(data.message || "Failed to fetch order details");
        }
      } catch (error) {
        console.error("OrderSuccess: Fetch error:", error);
        setError(`Failed to load order details: ${error.message}`);
        toast.error(`Failed to load order details: ${error.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
        navigate("/orders");
      } finally {
        setIsFetching(false);
      }
    };

    if (!location.state || urlOrderId) {
      fetchOrderDetails();
    }
  }, [auth, navigate, location.state, urlOrderId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("NGN", "₦");

  const generateReceiptPDF = async () => {
    setIsDownloading(true);
    setError("");
    try {
      const element = document.getElementById("receipt-content");
      if (!element) {
        throw new Error("Receipt content not found.");
      }

      // Temporarily hide buttons
      const buttons = element.querySelectorAll("button");
      buttons.forEach((btn) => (btn.style.display = "none"));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("receipt-content");
          if (clonedElement) {
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach((el) => {
              const computedStyle = window.getComputedStyle(el);
              const backgroundColor = computedStyle.backgroundColor;
              const color = computedStyle.color;

              if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)") {
                el.style.backgroundColor = toHexColor(backgroundColor);
              }
              if (color) {
                el.style.color = toHexColor(color);
              }
            });
          }
        },
      });

      // Restore buttons
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
      pdf.save(`Sabilay_Receipt_${orderData.orderId || "order"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate receipt. Please try again.");
      toast.error("Failed to generate receipt. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const toHexColor = (color) => {
    if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
      return color;
    }

    if (color.startsWith("oklch")) {
      const colorMap = {
        "oklch(65.92% 0.185 28.07)": "#CB5B6A",
        "oklch(51.01% 0.043 252.99)": "#4B5563",
        "oklch(97.14% 0.013 252.99)": "#F9FAFB",
        "oklch(52.95% 0.143 142.5)": "#15803D",
        "oklch(29.23% 0.035 252.99)": "#1F2A44",
        "oklch(76.63% 0.022 142.5)": "#BBF7D0",
        "oklch(54.86% 0.139 27.52)": "#DC2626",
        "oklch(96.08% 0.013 27.52)": "#FEF2F2",
      };
      return colorMap[color] || "#000000";
    }

    if (color.startsWith("rgb")) {
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)
          .toUpperCase()}`;
      }
    }

    return color;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setError("");
    try {
      window.print();
    } catch (err) {
      console.error("Print error:", err);
      setError("Failed to initiate print. Please try again.");
      toast.error("Failed to initiate print. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  const handleTrackOrder = () => {
    clearCart();
    navigate("/order-tracking", {
      state: { orderId: orderData.orderId, address: orderData.address },
    });
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB5B6A]"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData || error) {
    return (
      <div className="max-w-[800px] mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 my-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Error Loading Order
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {error ||
              "No order data available. Please access through a valid order."}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 inline-flex py-2 px-4 bg-[#CB5B6A] hover:bg-[#CB5B6A]/80 text-white text-sm font-medium rounded-md transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="receipt-content"
      className="max-w-[800px] mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 my-8 font-poppins"
    >
      <ToastContainer position="top-right" autoClose={3000} />
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
            <p className="text-sm font-medium text-gray-900">Order Reference</p>
            <p className="text-sm text-gray-600">{orderData.orderId}</p>
          </div>
          <div className="border border-gray-200 p-4 rounded-md sm:text-right">
            <p className="text-sm font-medium text-gray-900">Payment</p>
            <p className="text-sm text-gray-600 capitalize">
              {orderData.paymentMethod}
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Items</h3>
          <div className="space-y-2">
            {orderData.items.length > 0 ? (
              orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        item.product?.images?.[0] || "/placeholder-image.jpg"
                      }
                      alt={item.product?.name || "Product"}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-gray-600">
                      {item.product?.name || "Unknown Product"} x{" "}
                      {item.quantity}
                      {item.customization_id && (
                        <span className="ml-2 inline-block bg-[#CB5B6A] text-white text-xs px-2 py-1 rounded">
                          Customized
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">
                No items found for this order.
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              {formatCurrency(orderData.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-gray-900">
              {formatCurrency(orderData.discount_amount || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT ({orderData.tax_rate}%)</span>
            <span className="text-gray-900">
              {formatCurrency(orderData.vat)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery</span>
            <span className="text-gray-900">
              {formatCurrency(orderData.delivery)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {formatCurrency(orderData.total)}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Delivery Address
          </h3>
          <div className="text-sm text-gray-600">
            {orderData.address &&
            orderData.address.name &&
            orderData.address.address ? (
              <>
                <p>{orderData.address.name}</p>
                <p>{orderData.address.address}</p>
              </>
            ) : (
              <p>No address provided for this order.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 no-print">
          <button
            onClick={generateReceiptPDF}
            disabled={isDownloading || isFetching}
            className={`flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
              isDownloading || isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Download order receipt as PDF"
          >
            <Download size={16} />
            {isDownloading ? "Downloading..." : "Download Receipt"}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting || isFetching}
            className={`flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
              isPrinting || isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Print order receipt"
          >
            <Printer size={16} />
            {isPrinting ? "Preparing Print..." : "Print Receipt"}
          </button>
          <button
            onClick={handleTrackOrder}
            disabled={isFetching}
            className={`flex-1 py-2 px-4 bg-[#CB5B6A] hover:bg-[#CB5B6A]/80 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .animate-fade-in,
          .hover\\:scale-110,
          .hover\\:bg-gray-50,
          .transition-colors,
          .transition-transform {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
