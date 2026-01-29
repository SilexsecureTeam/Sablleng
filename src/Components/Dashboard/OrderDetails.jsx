import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  User,
  MapPin,
  CreditCard,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";

const OrderDetails = () => {
  const { auth } = useContext(AuthContext);
  const { reference } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For modal preview
  const [compositeImage, setCompositeImage] = useState(null);
  const previewCanvasRef = useRef(null);

  const baseUrl = "https://api.sablle.ng/storage/";

  // Fetch single order details
  const fetchOrderDetails = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/admin/orders/${reference}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
            Accept: "application/json",
          },
        },
      );

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      let orderData = data.order;

      if (Array.isArray(orderData)) {
        orderData =
          orderData.find((o) => o.order_reference === reference) || null;
      }

      if (!orderData) throw new Error("Order not found.");

      const formattedOrder = {
        numericId: orderData.id,
        id: orderData.order_reference,
        subtotal: `₦${parseFloat(orderData.subtotal).toLocaleString()}`,
        deliveryFee: `₦${parseFloat(orderData.delivery_fee).toLocaleString()}`,
        total: `₦${parseFloat(orderData.total).toLocaleString()}`,
        discount: orderData.discount_amount
          ? `₦${parseFloat(orderData.discount_amount).toLocaleString()}`
          : "₦0.00",
        taxRate: `${orderData.tax_rate}%`,
        taxAmount: `₦${parseFloat(orderData.tax_amount).toLocaleString()}`,
        shippingAddress: orderData.shipping_address,
        paymentMethod: orderData.payment_method.toUpperCase(),
        status: orderData.status.toUpperCase(),
        orderStatus: orderData.order_status,
        createdAt: new Date(orderData.created_at).toLocaleDateString("en-GB"),
        updatedAt: new Date(orderData.updated_at).toLocaleDateString("en-GB"),
        customer: {
          name: orderData.user?.name || "Unknown Customer",
          email: orderData.user?.email || "N/A",
        },
        coupon: orderData.coupon_code || "None",
        items: orderData.items || [],
      };

      setOrder(formattedOrder);
      toast.success("Order details loaded!", { autoClose: 2000 });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedImage?.item?.customization || !previewCanvasRef.current) {
      setCompositeImage(selectedImage?.src || null);
      return;
    }

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const item = selectedImage.item;
    const cust = item.customization;

    // Use proxied product src (same as thumbnail)
    const proxiedProductSrc = `https://api.allorigins.win/raw?url=${encodeURIComponent(selectedImage.src)}`;

    const productImg = new Image();
    productImg.crossOrigin = "anonymous"; // keep for safety
    productImg.src = proxiedProductSrc;

    productImg.onload = () => {
      console.log("Product loaded OK via proxy");
      canvas.width = productImg.width;
      canvas.height = productImg.height;
      ctx.drawImage(productImg, 0, 0);

      // Logo with proxy + encode
      if (cust.image_path) {
        const proxiedLogoSrc = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${baseUrl}${cust.image_path}`)}`;

        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = `/storage/${cust.image_path}`;

        logoImg.onload = () => {
          console.log("Logo loaded OK via proxy");
          const sizeRatio = parseFloat(cust.image_size || 0.1);
          const logoSize = productImg.width * sizeRatio;

          ctx.drawImage(
            logoImg,
            cust.coordinates.x - logoSize / 2,
            cust.coordinates.y - logoSize / 2,
            logoSize,
            logoSize,
          );

          // Text drawing (same as before)
          if (cust.text) {
            const fontSize = 32;
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText(
              cust.text,
              cust.coordinates.x,
              cust.coordinates.y + logoSize / 2 + fontSize,
            );

            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(
              cust.text,
              cust.coordinates.x,
              cust.coordinates.y + logoSize / 2 + fontSize,
            );
          }

          setCompositeImage(canvas.toDataURL("image/png"));
        };

        logoImg.onerror = (err) => {
          console.error("Logo proxy failed:", proxiedLogoSrc, err);
          // Fallback: continue without logo
          setCompositeImage(canvas.toDataURL("image/png"));
        };
      } else {
        setCompositeImage(canvas.toDataURL("image/png"));
      }
    };

    productImg.onerror = (err) => {
      console.error("Product proxy failed:", proxiedProductSrc, err);
      setCompositeImage(selectedImage.src); // fallback to plain
    };
  }, [selectedImage]);

  // Update order status
  const updateOrderStatus = async (newStatus) => {
    if (!order?.numericId || !auth.token) return;

    setIsUpdatingStatus(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PATCH");
      formData.append("order_status", newStatus);

      const response = await fetch(
        `https://api.sablle.ng/api/admin/orders/status/${order.numericId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success(data.message || "Order status updated successfully!", {
        autoClose: 3000,
      });

      await fetchOrderDetails();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (reference) {
      fetchOrderDetails();
    }
  }, [reference, auth.token, navigate]);

  const getStatusStyle = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "paid") {
      return "bg-[#E8FAE7] text-[#01993C]";
    } else if (lowerStatus === "pending") {
      return "bg-[#DAD3BC] text-[#414245]";
    }
    return "bg-gray-200 text-gray-600";
  };

  const formatPrice = (amount) =>
    `₦${parseFloat(amount || 0).toLocaleString()}`;

  const safeItems = order?.items || [];

  const acceptedStatuses = [
    "Order Placed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <p className="text-red-600 text-center py-12">{error}</p>
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="w-full bg-[#5F1327] text-white py-2 rounded-md hover:bg-[#B54F5E]"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-2 text-[#5F1327] hover:bg-[#B54F5E]/10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <h1 className="text-2xl font-semibold text-[#141718]">
          Order Details - #{order?.id?.slice(0, 7) || reference}
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Customer Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#141718] mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                  <p className="text-sm text-[#141718] font-medium">
                    {order.customer.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-500">Date</p>
                </div>
                <p className="font-medium text-[#141718]">
                  Placed: {order.createdAt}
                </p>
                <p className="text-sm text-gray-600">
                  Updated: {order.updatedAt}
                </p>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.status,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5F1327] disabled:opacity-50"
                  >
                    {acceptedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </p>
                <p className="font-medium text-[#141718]">
                  {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#141718] mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Items ({safeItems.length})
              </h3>
              {safeItems.length > 0 ? (
                <div className="space-y-3">
                  {safeItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          {item.product?.images?.length > 0 ? (
                            <img
                              src={`/storage/${item.product.images[0].path}`} // use .path from your API
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90 transition"
                              onClick={() =>
                                setSelectedImage({
                                  src: `/storage/${item.product.images[0].path}`,
                                  alt: item.product.name,
                                  item, // pass full item so we can access customization in modal
                                })
                              }
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg"; // fallback
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                              No Img
                            </div>
                          )}

                          {/* Red Customized badge - show if customization exists */}
                          {item.customization_id || item.customization ? (
                            <span className="absolute -top-1 -right-1 bg-[#5F1327] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                              Customized
                            </span>
                          ) : null}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-sm text-[#141718]">
                            {item.product?.name || `Item ${item.product_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} • Color: {item.color || "N/A"}
                            {item.customization_id && (
                              <span className="ml-2 inline-block bg-[#5F1327] text-white text-xs px-1 py-0.5 rounded">
                                Customized
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[#5F1327]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items in this order.
                </p>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#141718] mb-4">
                Order Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({order.taxRate})</span>
                  <span>{order.taxAmount}</span>
                </div>
                {order.discount !== "₦0.00" && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span>-{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Coupon</span>
                  <span>{order.coupon}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold text-[#5F1327]">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#141718] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">Order not found.</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedImage(null);
            setCompositeImage(null); // reset
          }}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-800 z-10 transition"
              onClick={() => {
                setSelectedImage(null);
                setCompositeImage(null);
              }}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              {selectedImage.item?.customization ? (
                <div className="relative">
                  {/* Hidden canvas for generating composite */}
                  <canvas
                    ref={previewCanvasRef}
                    className="hidden"
                    width={800} // reasonable default, will resize on load
                    height={800}
                  />

                  {/* Show composite if ready, else loading */}
                  {compositeImage ? (
                    <img
                      src={`https://api.allorigins.win/raw?url=${encodeURIComponent(selectedImage.src)}`}
                      alt={selectedImage.alt}
                      className="max-w-full max-h-[75vh] mx-auto object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto mb-4"></div>
                      <p className="text-gray-600">Generating preview...</p>
                    </div>
                  )}

                  {/* Small info below */}
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>
                      <strong>Text:</strong> "
                      {selectedImage.item.customization.text || "None"}"
                      {selectedImage.item.customization.instruction && (
                        <>
                          {" "}
                          | <strong>Instruction:</strong> "
                          {selectedImage.item.customization.instruction}"
                        </>
                      )}
                    </p>
                    <p className="mt-1">
                      Position: {selectedImage.item.customization.position} |
                      Size:{" "}
                      {(
                        parseFloat(
                          selectedImage.item.customization.image_size || 0,
                        ) * 100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                // Non-customized: just show product image
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[75vh] mx-auto object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
