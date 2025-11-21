import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  User,
  MapPin,
  CreditCard,
  Package,
  ShoppingBag,
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
        }
      );

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      let orderData = data.order; // Use data.order as per response structure

      // Handle if response is array (fallback) or single object
      if (Array.isArray(orderData)) {
        orderData =
          orderData.find((o) => o.order_reference === reference) || null;
      }

      if (!orderData) throw new Error("Order not found.");

      // Format for display
      const formattedOrder = {
        numericId: orderData.id, // Numeric ID for update endpoint
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
        items: orderData.items || [], // Ensure array
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
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success(data.message || "Order status updated successfully!", {
        autoClose: 3000,
      });

      // Refetch to update UI
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

  // Status badge style
  const getStatusStyle = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "paid") {
      return "bg-[#E8FAE7] text-[#01993C]";
    } else if (lowerStatus === "pending") {
      return "bg-[#DAD3BC] text-[#414245]";
    }
    return "bg-gray-200 text-gray-600";
  };

  // Format price helper (like in OrderSuccess)
  const formatPrice = (amount) =>
    `₦${parseFloat(amount || 0).toLocaleString()}`;

  // Safe items getter
  const safeItems = order?.items || [];

  // Accepted statuses
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

      {/* Header with Back Button */}
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

            {/* Status and Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.status
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
                      <div className="flex items-center gap-3 flex-1">
                        {/* Placeholder for image - use first image if available */}
                        {item.product?.images?.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Img</span>
                          </div>
                        )}
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
    </div>
  );
};

export default OrderDetails;
