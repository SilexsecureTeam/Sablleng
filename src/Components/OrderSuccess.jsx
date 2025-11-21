import React, { useContext, useState, useEffect, memo } from "react";
import { Check, Download, Printer } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../assets/logo-d.png";

const OrderSuccess = () => {
  const { auth } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();
  const [orderData, setOrderData] = useState(location.state || null);
  const [isFetching, setIsFetching] = useState(false);
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
  }, [location.state, urlOrderId, navigate, location]);

  // Check authentication and fetch order details
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      toast.error("Please log in to view your order confirmation", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/signin", { state: { from: location } });
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
  }, [auth, navigate, location.state, urlOrderId, location]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("NGN", "₦");

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

  // PDF Styles
  const pdfStyles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: 30,
      fontFamily: "Helvetica",
    },
    section: {
      margin: 10,
      padding: 10,
    },
    title: {
      fontSize: 24,
      textAlign: "center",
      marginBottom: 20,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 12,
      textAlign: "center",
      marginBottom: 30,
      color: "#6B7280",
    },
    successIcon: {
      width: 60,
      height: 60,
      borderWidth: 2,
      borderColor: "#10B981",
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      backgroundColor: "#D1FAE5",
    },
    checkIcon: {
      fontSize: 30,
      color: "#10B981",
    },
    detailGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 6,
      padding: 15,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#111827",
    },
    detailValue: {
      fontSize: 12,
      color: "#6B7280",
      textAlign: "right",
    },
    itemsTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#111827",
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      fontSize: 12,
    },
    itemImage: {
      width: 40,
      height: 40,
      borderRadius: 4,
      marginRight: 10,
    },
    itemInfo: {
      flex: 1,
      color: "#6B7280",
    },
    itemPrice: {
      fontSize: 12,
      color: "#111827",
    },
    summary: {
      marginTop: 20,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
      fontSize: 12,
    },
    summaryLabel: {
      color: "#6B7280",
    },
    summaryValue: {
      color: "#111827",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#111827",
      fontSize: 16,
      fontWeight: "bold",
    },
    addressTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
      marginTop: 20,
      color: "#111827",
    },
    addressText: {
      fontSize: 12,
      color: "#6B7280",
      lineHeight: 1.4,
    },
    customizedBadge: {
      backgroundColor: "#5F1327",
      color: "#FFFFFF",
      fontSize: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 3,
      marginLeft: 5,
    },
  });

  // Memoized PDF Document Component (prevents unnecessary re-renders)
  const ReceiptPDF = memo(({ orderData }) => (
    <Document key={`doc-${orderData.orderId}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          {/* Success Section */}
          <View style={{ width: 60, height: 60, margin: "0 auto 20px" }}>
            <Image
              source={{ uri: "/logo-d.png" }}
              style={{
                width: 60,
                height: 60,
                objectFit: "contain",
              }}
            />
          </View>
          <Text style={pdfStyles.title}>Order Placed Successfully!</Text>
          <Text style={pdfStyles.subtitle}>
            Thank you for shopping with Sabilay
          </Text>

          {/* Order Details Grid */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={pdfStyles.detailGrid}>
              <Text style={pdfStyles.detailLabel}>Order Reference</Text>
              <Text style={pdfStyles.detailValue}>{orderData.orderId}</Text>
            </View>
            <View style={pdfStyles.detailGrid}>
              <Text style={pdfStyles.detailLabel}>Payment</Text>
              <Text style={pdfStyles.detailValue}>
                {orderData.paymentMethod}
              </Text>
            </View>
          </View>

          {/* Items */}
          <Text style={pdfStyles.itemsTitle}>Items</Text>
          <View style={{ marginBottom: 20 }}>
            {orderData.items.length > 0 ? (
              orderData.items.map((item, index) => (
                <View
                  key={`item-${item.id}-${index}`}
                  style={pdfStyles.itemRow}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    {item.product?.images?.[0] && (
                      <Image
                        source={{ uri: item.product.images[0] }}
                        style={pdfStyles.itemImage}
                      />
                    )}
                    <View style={pdfStyles.itemInfo}>
                      <Text>
                        {item.product?.name || "Unknown Product"} x{" "}
                        {item.quantity}
                      </Text>
                      {item.customization_id && (
                        <Text style={pdfStyles.customizedBadge}>
                          Customized
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={pdfStyles.itemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                No items found for this order.
              </Text>
            )}
          </View>

          {/* Order Summary */}
          <View style={pdfStyles.summary}>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(orderData.subtotal)}
              </Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Discount</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(orderData.discount_amount || 0)}
              </Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>
                VAT ({orderData.tax_rate}%)
              </Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(orderData.vat)}
              </Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Delivery</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(orderData.delivery)}
              </Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {formatCurrency(orderData.total)}
              </Text>
            </View>
          </View>

          {/* Delivery Address */}
          <Text style={pdfStyles.addressTitle}>Delivery Address</Text>
          <View>
            {orderData.address &&
            orderData.address.name &&
            orderData.address.address ? (
              <>
                <Text style={pdfStyles.addressText}>
                  {orderData.address.name}
                </Text>
                <Text style={pdfStyles.addressText}>
                  {orderData.address.address}
                </Text>
              </>
            ) : (
              <Text style={pdfStyles.addressText}>
                No address provided for this order.
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  ));

  // Simple Error Boundary for PDF (prevents full crash)
  const PDFErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
      if (hasError) {
        toast.error("PDF generation failed—try refreshing.");
        setHasError(false);
      }
    }, [hasError]);
    return hasError ? <span>PDF Preview Unavailable</span> : children;
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327]"></div>
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
            className="mt-4 inline-flex py-2 px-4 bg-[#5F1327] hover:bg-[#5F1327]/80 text-white text-sm font-medium rounded-md transition-colors"
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5F1327] rounded-full mb-4 border-2 border-green-[#5F1327]/40 p-2 transform transition-transform hover:scale-110">
          <img
            src={logo}
            alt="Success"
            className="w-full h-full object-contain"
          />
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
            <p className="text-sm text-gray-600">
              {orderData?.orderId?.slice(0, 7)}
            </p>
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
                        <span className="ml-2 inline-block bg-[#5F1327] text-white text-xs px-2 py-1 rounded">
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
          <PDFErrorBoundary>
            <PDFDownloadLink
              document={<ReceiptPDF orderData={orderData} />}
              fileName={`Sabilay_Receipt_${orderData.orderId || "order"}.pdf`}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              {({ loading }) =>
                loading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download size={16} />
                    Download Receipt
                  </>
                )
              }
            </PDFDownloadLink>
          </PDFErrorBoundary>
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
            className={`flex-1 py-2 px-4 bg-[#5F1327] hover:bg-[#5F1327]/80 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
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
