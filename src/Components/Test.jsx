import React, { useContext, useState, useEffect, memo } from "react";
import { Download, Printer, Phone, Plus, Trash2 } from "lucide-react";
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
// import logo from "../assets/logo-d.png";

const Test = () => {
  const { auth } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();

  const [orderData, setOrderData] = useState(location.state || null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "https://api.sablle.ng/api";

  // Same auth + fetch logic (untouched)
  useEffect(() => {
    if (!location.state && !urlOrderId) {
      toast.warn("Please select an order from your order history");
      navigate("/orders");
    }
  }, [location.state, urlOrderId, navigate]);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      toast.error("Please log in to view your order");
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
            address: data.order.shipping_address,
            customerName: auth.user?.name || "Valued Customer",
            orderDate: new Date(data.order.created_at).toLocaleDateString(
              "en-GB"
            ),
            paymentMethod: data.order.payment_method || "Card",
            tax_rate: parseFloat(data.order.tax_rate) || 7.5,
          });
          // Only clear cart after successful fetch
          clearCart();
        } else {
          throw new Error(data.message || "Failed to load order");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load order details");
        navigate("/orders");
      } finally {
        setIsFetching(false);
      }
    };

    if (!location.state || urlOrderId) {
      fetchOrderDetails();
    } else if (location.state) {
      clearCart();
    }
  }, [auth, navigate, location.state, urlOrderId, location, clearCart]);

  const formatCurrency = (amount) => {
    if (!amount) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    })
      .format(amount)
      .replace("NGN", "₦");
  };

  const handlePrint = () => {
    window.print();
  };

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
            className="px-6 py-3 bg-[#8b7355] text-white rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-4 print:p-0 print:bg-white">
        <div className="max-w-4xl mx-auto bg-[#fefdfb] shadow-2xl border-8 border-[#8b7355] p-10 print:border-8 print:shadow-none print:max-w-full">
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

          {/* Bill To & Invoice Info */}
          <div className="flex justify-between mb-10">
            <div className="w-1/2">
              <div className="text-sm font-bold text-gray-600 mb-2">
                BILL TO
              </div>
              <div className="text-sm leading-relaxed">
                <p className="font-semibold">{orderData.customerName}</p>
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

            {orderData.items.map((item, index) => (
              <div
                key={index}
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
          <div className="flex justify-end mt-10">
            <div className="w-5/12 text-sm">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>{" "}
                <span>{formatCurrency(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>VAT ({orderData.tax_rate}%):</span>{" "}
                <span>{formatCurrency(orderData.vat)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery:</span>{" "}
                <span>{formatCurrency(orderData.delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t-2 border-[#8b-800">
                <span>Total Amount:</span>
                <span>{formatCurrency(orderData.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300">
            <div className="text-sm font-bold mb-3">Notes / Payment Info</div>
            <div className="text-xs leading-relaxed text-gray-700">
              <p>Thank you for shopping with SABLLE</p>
              <p className="mt-3">For bank transfers, kindly pay to:</p>
              <p className="mt-2">
                <span className="font-bold">Account Name:</span> SABLLE NIG LTD
                <br />
                <span className="font-bold">Account No:</span> 1304461853
                <br />
                <span className="font-bold">Bank:</span> Providus Bank
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 text-center text-sm text-gray-500">
            This invoice was generated automatically • www.sablle.ng
          </div>

          {/* Action Buttons - Hidden on Print */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 print:hidden">
            <PDFDownloadLink
              document={<ReceiptPDF orderData={orderData} />}
              fileName={`SABLLE_Invoice_${orderData.orderId}.pdf`}
              className="flex-1 py-3 px-6 border-2 border-[#8b7355] text-[#8b7355] rounded-lg font-bold hover:bg-[#8b7355] hover:text-white transition flex items-center justify-center gap-2"
            >
              {({ loading }) => (
                <>
                  <Download size={20} />
                  {loading ? "Preparing PDF..." : "Download PDF"}
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
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

// Keep the old PDF as fallback (optional)
const ReceiptPDF = memo(({ orderData }) => (
  <Document>
    <Page size="A4" style={{ padding: 40 }}>
      <Text
        style={{
          fontSize: 30,
          textAlign: "center",
          marginBottom: 20,
          color: "#8b7355",
        }}
      >
        SABLLE INVOICE
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 30 }}>
        Order: {orderData.orderId}
      </Text>
      {/* You can reuse the same layout here later if you want */}
    </Page>
  </Document>
));

export default Test;
