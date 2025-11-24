import React, { useState, useEffect, useContext } from "react";
import { Check, ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const orderReference = location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "https://api.sablle.ng/api";

  // Map order_status → step number (1 to 6)
  const statusMap = {
    "Order Pending": 1,
    Processing: 2,
    Packed: 3,
    Shipped: 4,
    "Out for Delivery": 5,
    Delivered: 6,
  };

  const steps = [
    { id: 1, title: "Order Placed" },
    { id: 2, title: "Processing" },
    { id: 3, title: "Packed" },
    { id: 4, title: "Shipped" },
    { id: 5, title: "Out for Delivery" },
    { id: 6, title: "Delivered" },
  ];

  useEffect(() => {
    if (!orderReference) {
      toast.error("No order found");
      navigate("/orders");
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/orders/${orderReference}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = await res.json();

        if (res.ok && data.order) {
          setOrder(data.order);
        } else {
          throw new Error(data.message || "Order not found");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderReference, auth.token, navigate]);

  const currentStep = order ? statusMap[order.order_status] || 1 : 1;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8b7355] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-xl text-[#8b7355] font-medium">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="text-center bg-white p-12 rounded-2xl shadow-2xl border-8 border-[#8b7355]">
          <p className="text-2xl text-red-600 mb-6">
            {error || "Order not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-10 py-4 bg-[#8b7355] text-white text-lg font-bold rounded-xl hover:bg-[#6d5942] flex items-center gap-3 mx-auto"
          >
            <ArrowLeft size={24} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border-8 border-[#8b7355] p-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#8b7355] tracking-wider">
              Order Tracking
            </h1>
            <p className="text-2xl font-mono text-gray-800 mt-4">
              {order.order_reference}
            </p>
            <p className="text-gray-600 mt-2">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          {/* Current Status */}
          <div className="text-center mb-12">
            <div className="inline-block px-10 py-4 bg-[#8b7355] text-white text-2xl font-bold rounded-full shadow-xl">
              {order.order_status}
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {steps.map((step, index) => {
              const isCompleted = step.id <= currentStep;
              const isLast = index === steps.length - 1;

              return (
                <div
                  key={step.id}
                  className="flex items-center mb-10 last:mb-0"
                >
                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-8 top-20 w-0.5 h-32 -z-10 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}

                  {/* Circle */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-all duration-500 shadow-2xl border-4 border-white ${
                      isCompleted
                        ? "bg-green-500 ring-8 ring-green-100 scale-110"
                        : "bg-gray-300"
                    }`}
                  >
                    <Check className="w-10 h-10" />
                  </div>

                  {/* Text */}
                  <div className="ml-8 flex-1">
                    <h3
                      className={`text-2xl font-bold ${
                        isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                      {step.id === currentStep && (
                        <span className="ml-4 text-lg font-normal text-amber-600">
                          ← Current Status
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Details - One Line */}
          <div className="mt-16 bg-[#fefdfb] p-8 rounded-2xl border-4 border-[#8b7355] text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-700 text-lg font-medium">
              <span className="flex items-center gap-2">
                <strong>{order.customer_name}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Phone size={20} /> {order.customer_phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail size={20} /> {order.customer_email}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={20} /> {order.shipping_address}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-4 px-12 py-5 bg-[#8b7355] text-white text-xl font-bold rounded-full hover:bg-[#6d5942] transform hover:scale-105 transition-all shadow-2xl"
            >
              <ArrowLeft size={28} />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
