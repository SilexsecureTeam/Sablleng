import React, { useContext, useState, useEffect, memo } from "react";
import { Download, Printer, Phone } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const OrderSuccess = () => {
  const { auth } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();

  const [orderData, setOrderData] = useState(location.state || null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "https://api.sablle.ng/api";

  useEffect(() => {
    if (!location.state && !urlOrderId) {
      // toast.warn("Please select an order from your order history");
      navigate("/orders");
      return;
    }
  }, [location.state, urlOrderId, navigate]);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      // toast.error("Please log in to view your order");
      navigate("/signin", { state: { from: location } });
      return;
    }

    const fetchOrderDetails = async () => {
      const orderIdToFetch = urlOrderId || location.state?.orderId;
      if (!orderIdToFetch) {
        setError("No order reference provided.");
        navigate("/orders");
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/${encodeURIComponent(orderIdToFetch)}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.order) {
          setOrderData({
            orderId: data.order.order_reference,
            items: data.order.items || [],
            subtotal: parseFloat(data.order.subtotal) || 0,
            vat: parseFloat(data.order.tax_amount) || 0,
            delivery: parseFloat(data.order.delivery_fee) || 0,
            total: parseFloat(data.order.total) || 0,
            discount_amount: parseFloat(data.order.discount_amount) || 0,
            address: data.order.shipping_address || "Not provided",
            customerName:
              data.order.customer_name || auth.user?.name || "Valued Customer",
            customerEmail: data.order.customer_email || auth.user?.email || "",
            customerPhone: data.order.customer_phone || auth.user?.phone || "",
            orderDate: data.order.created_at
              ? new Date(data.order.created_at).toLocaleDateString("en-GB")
              : new Date().toLocaleDateString("en-GB"),
            paymentMethod: data.order.payment_method || "Card",
            tax_rate: parseFloat(data.order.tax_rate) || 7.5,
          });

          // Safe cart clear
          if (typeof clearCart === "function") {
            clearCart();
          }
        } else {
          throw new Error(data.message || "Failed to load order");
        }
      } catch (err) {
        setError(err.message);
        // toast.error("Failed to load order details");
        navigate("/orders");
      } finally {
        setIsFetching(false);
      }
    };

    if (!location.state || urlOrderId) {
      fetchOrderDetails();
    } else if (location.state) {
      if (typeof clearCart === "function") clearCart();
    }
  }, [auth, navigate, location.state, urlOrderId, location, clearCart]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    })
      .format(amount)
      .replace("NGN", "₦");
  };

  const handlePrint = () => window.print();

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b7355] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your beautiful invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!orderData || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 bg-[#8b7355] text-white rounded-lg hover:bg-[#6d5942]"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <ToastContainer /> */}

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-4 print:p-0 print:bg-white">
        <div className="max-w-4xl mx-auto bg-[#fefdfb] shadow-2xl border-8 border-[#8b7355] p-10 print:border-8 print:shadow-none print:max-w-full print:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-4xl font-bold tracking-wider text-[#8b7355] border-4 border-[#8b7355] px-6 py-3 inline-block">
                SABLLE
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold text-[#8b7355] text-lg">SABLLE</div>
              <div className="text-gray-700">Lagos, Nigeria</div>
              <div className="flex items-center justify-end gap-1 mt-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">+234 818 729 0260</span>
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b7355] to-[#8b7355]"></div>
            <div className="mx-6 relative">
              <div className="border-4 border-[#8b7355] px-12 py-4 bg-[#fefdfb]">
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-[#8b7355]"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-[#8b7355]"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-[#8b7355]"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-[#8b7355]"></div>
                <span className="text-3xl font-serif text-[#c4a052]">
                  Invoice
                </span>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#8b7355] to-[#8b7355]"></div>
          </div>

          {/* Bill To & Info */}
          <div className="flex justify-between mb-10">
            <div className="w-1/2">
              <div className="text-sm font-bold text-gray-600 mb-2">
                BILL TO
              </div>
              <div className="text-sm leading-relaxed">
                <p className="font-semibold">{orderData.customerName}</p>
                {orderData.customerEmail && (
                  <p className="text-gray-700">{orderData.customerEmail}</p>
                )}
                {orderData.customerPhone && (
                  <p className="text-gray-700">{orderData.customerPhone}</p>
                )}
                <p className="text-gray-700">{orderData.address}</p>
              </div>
            </div>
            <div className="w-5/12 text-sm">
              <div className="flex justify-between mb-3">
                <span className="font-bold">Invoice No:</span>{" "}
                <span>{orderData.orderId}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-bold">Date:</span>{" "}
                <span>{orderData.orderDate}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-bold">Payment:</span>{" "}
                <span className="capitalize">{orderData.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="border-t-4 border-b-4 border-[#8b7355] py-3 mb-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-800">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
            </div>

            {orderData.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-4 mb-4 items-center text-sm"
              >
                <div className="col-span-6">
                  {item.product?.name || "Product"}
                  {item.customization_id && (
                    <span className="ml-2 inline-block bg-[#5F1327] text-white text-xs px-2 py-1 rounded">
                      Customized
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-5/12 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>{" "}
                <span>{formatCurrency(orderData.subtotal)}</span>
              </div>
              {orderData.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>{" "}
                  <span>-{formatCurrency(orderData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>VAT ({orderData.tax_rate}%):</span>{" "}
                <span>{formatCurrency(orderData.vat)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>{" "}
                <span>{formatCurrency(orderData.delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-[#8b7355]">
                <span>Total Paid:</span>
                <span>{formatCurrency(orderData.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300">
            <div className="text-sm font-bold mb-3">Notes / Payment Info</div>
            <div className="text-xs leading-relaxed text-gray-700 space-y-2">
              <p>Thank you for shopping with SABLLE</p>
              <p>For bank transfers, kindly pay to:</p>
              <div className="mt-3 font-medium">
                <p>Account Name: SABLLE NIG LTD</p>
                <p>Account No: 1304461853</p>
                <p>Bank: Providus Bank</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 text-center text-sm text-gray-500">
            This invoice was generated automatically • www.sablle.ng
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 print:hidden">
            <PDFDownloadLink
              document={
                <ReceiptPDF
                  orderData={orderData}
                  formatCurrency={formatCurrency}
                />
              }
              fileName={`SABLLE_Invoice_${orderData.orderId}.pdf`}
              className="flex-1 py-3 px-6 border-2 border-[#8b7355] text-[#8b7355] rounded-lg font-bold hover:bg-[#8b7355] hover:text-white transition flex items-center justify-center gap-2"
            >
              {({ loading }) => (
                <>
                  <Download size={20} />
                  {loading ? "Preparing..." : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>

            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-6 bg-[#8b7355] text-white rounded-lg font-bold hover:bg-[#6d5942] transition flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              Print Invoice
            </button>

            <button
              onClick={() =>
                navigate("/order-tracking", {
                  state: { orderId: orderData.orderId },
                })
              }
              className="flex-1 py-3 px-6 bg-[#5F1327] text-white rounded-lg font-bold hover:bg-[#4a0f1f] transition flex items-center justify-center gap-2"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-8,
          .print\\:border-8 * {
            visibility: visible;
          }
          .print\\:border-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

// Luxury PDF matching the design (no blank now)
const ReceiptPDF = memo(({ orderData, formatCurrency }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.section}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={pdfStyles.headerText}>SABLLE</Text>
          <View>
            <Text style={pdfStyles.companyInfo}>SABLLE</Text>
            <Text style={pdfStyles.companyInfo}>Lagos, Nigeria</Text>
            <Text style={pdfStyles.companyInfo}>+234 818 729 0260</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={pdfStyles.title}>Invoice</Text>

        {/* Bill To */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View style={{ width: "50%" }}>
            <Text style={pdfStyles.label}>BILL TO</Text>
            <Text style={pdfStyles.info}>{orderData.customerName}</Text>
            {orderData.customerEmail && (
              <Text style={pdfStyles.info}>{orderData.customerEmail}</Text>
            )}
            {orderData.customerPhone && (
              <Text style={pdfStyles.info}>{orderData.customerPhone}</Text>
            )}
            <Text style={pdfStyles.info}>{orderData.address}</Text>
          </View>
          <View style={{ width: "40%" }}>
            <Text style={pdfStyles.label}>Invoice No: {orderData.orderId}</Text>
            <Text style={pdfStyles.label}>Date: {orderData.orderDate}</Text>
            <Text style={pdfStyles.label}>
              Payment: {orderData.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Items */}
        <Text style={pdfStyles.itemsTitle}>Items</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.tableCellWide}>Description</Text>
          <Text style={pdfStyles.tableCell}>Qty</Text>
          <Text style={pdfStyles.tableCell}>Price</Text>
          <Text style={pdfStyles.tableCell}>Amount</Text>
        </View>
        {orderData.items.map((item, i) => (
          <View key={i} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellWide}>
              {item.product?.name || "Product"}
              {item.customization_id && (
                <Text style={pdfStyles.badge}>Customized</Text>
              )}
            </Text>
            <Text style={pdfStyles.tableCell}>{item.quantity}</Text>
            <Text style={pdfStyles.tableCell}>
              {formatCurrency(item.price)}
            </Text>
            <Text style={pdfStyles.tableCell}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={pdfStyles.summary}>
          <View style={pdfStyles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(orderData.subtotal)}</Text>
          </View>
          {orderData.discount_amount > 0 && (
            <View style={pdfStyles.summaryRow}>
              <Text>Discount</Text>
              <Text>-{formatCurrency(orderData.discount_amount)}</Text>
            </View>
          )}
          <View style={pdfStyles.summaryRow}>
            <Text>VAT ({orderData.tax_rate}%)</Text>
            <Text>{formatCurrency(orderData.vat)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text>Delivery</Text>
            <Text>{formatCurrency(orderData.delivery)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text>Total</Text>
            <Text>{formatCurrency(orderData.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        <Text style={pdfStyles.notesTitle}>Notes / Payment Info</Text>
        <Text style={pdfStyles.notesText}>
          Thank you for shopping with SABLLE. For bank transfers: Account Name:
          SABLLE NIG LTD, Account No: 1304461853, Bank: Providus Bank.
        </Text>
      </View>
    </Page>
  </Document>
));

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#fefdfb" },
  section: { marginBottom: 20 },
  headerText: { fontSize: 32, fontWeight: "bold", color: "#8b7355" },
  companyInfo: { fontSize: 10, color: "#6B7280" },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#c4a052",
    fontWeight: "bold",
  },
  label: { fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  info: { fontSize: 10, marginBottom: 2, color: "#6B7280" },
  itemsTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#8b7355",
    marginBottom: 10,
  },
  tableRow: { flexDirection: "row", marginBottom: 5 },
  tableCellWide: { width: "50%", fontSize: 10 },
  tableCell: { width: "16.67%", fontSize: 10, textAlign: "right" },
  badge: {
    backgroundColor: "#5F1327",
    color: "white",
    fontSize: 8,
    padding: 2,
  },
  summary: { marginTop: 20 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#8b7355",
    paddingTop: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
  },
  notesText: { fontSize: 10, lineHeight: 1.4, color: "#6B7280" },
});

export default OrderSuccess;
