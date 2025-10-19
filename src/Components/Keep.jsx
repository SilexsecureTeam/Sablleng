import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";

const PaymentComponent = () => {
  const { items, selectedAddress, setItems, setTotal, setCartSessionId } =
    useContext(CartContext);
  const { auth } = useContext(AuthContext);
  const [selectedPayment, setSelectedPayment] = useState("paystack");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDelivery = location.state?.selectedDelivery || { value: 6000 };

  // Debug auth and Paystack keys
  useEffect(() => {
    console.log("PaymentComponent: auth state:", {
      isAuthenticated: auth.isAuthenticated,
      token: auth.token ? auth.token.substring(0, 20) + "..." : "Missing",
      email: auth.user?.email,
      isValidEmail:
        auth.user?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auth.user.email),
    });
    console.log("PaymentComponent: Paystack public key:", {
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? "Set" : "Missing",
      mode: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY.startsWith("pk_test")
        ? "Test"
        : "Live",
    });
  }, [auth]);

  const paymentMethods = [
    {
      id: "paystack",
      icon: i1,
      title: "Paystack",
      description: "Pay securely with card or bank transfer",
    },
    {
      id: "cod",
      icon: i2,
      title: "Cash on Delivery",
      description: "Pay when your order arrives",
    },
  ];

  // Calculate order summary
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const vat = subtotal * 0.075;
  const delivery = selectedDelivery.value;
  const total = subtotal + vat + delivery;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("NGN", "₦");

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () =>
      console.log("PaymentComponent: Paystack script loaded");
    script.onerror = () =>
      toast.error("Failed to load payment system. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });

    return () => document.body.removeChild(script);
  }, []);

  const verifyPayment = async (paystackReference, orderId) => {
    console.log("PaymentComponent: Verifying payment:", {
      paystackReference,
      orderId,
    });

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/verify-payment/${paystackReference}/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${auth.token}`, // Uncomment if backend requires token
          },
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "PaymentComponent: JSON parsing error:",
          jsonError.message
        );
        const rawResponse = await response.text();
        console.error(
          "PaymentComponent: Raw response:",
          rawResponse.slice(0, 200)
        );
        throw new Error(
          `Server returned non-JSON response (status: ${response.status})`
        );
      }

      console.log("PaymentComponent: Verification response:", data);

      if (response.ok && data.status === "success") {
        // Clear cart
        setItems([]);
        setTotal(0);
        setCartSessionId(null);
        localStorage.setItem("cart_items", JSON.stringify([]));
        localStorage.setItem("cart_total", 0);
        localStorage.removeItem("cart_session_id");

        toast.success("Payment successful! Order placed.", {
          position: "top-right",
          autoClose: 3000,
          onClose: () =>
            navigate("/order-success", {
              state: {
                orderId,
                items,
                subtotal,
                vat,
                delivery,
                total,
                address: selectedAddress,
              },
            }),
        });
      } else {
        const errorMessage =
          data.error ||
          data.message ||
          "Failed to verify payment. Please contact support.";
        console.error("PaymentComponent: Verification failed:", errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error(
        "PaymentComponent: Verification network error:",
        error.message
      );
      toast.error(
        "Network error during payment verification. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const handlePayment = async () => {
    // Validate auth
    if (!auth.isAuthenticated || !auth.token) {
      console.log("PaymentComponent: Redirecting to signin - auth issue");
      toast.error("Please log in to proceed with payment", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/signin");
      return;
    }

    if (
      !auth.user?.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auth.user.email)
    ) {
      console.log(
        "PaymentComponent: Invalid or missing email:",
        auth.user?.email
      );
      toast.error(
        "Valid email required for payment. Please update your profile.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      navigate("/signin");
      return;
    }

    const orderId = `SABIL-${new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`;
    const cleanOrderId = orderId.replace(/^SABIL-/, "");

    if (selectedPayment === "paystack") {
      if (total <= 0) {
        toast.error("Order amount must be greater than zero.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setIsProcessingPayment(true);
      try {
        if (!window.PaystackPop) {
          throw new Error("PaystackPop not loaded");
        }

        const handler = new window.PaystackPop();
        handler.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: auth.user.email,
          amount: total * 100, // Convert to kobo
          reference: `order_${orderId}_${Date.now()}`,
          callback: (response) => {
            console.log(
              "PaymentComponent: Payment complete! Reference:",
              response.reference
            );
            verifyPayment(response.reference, cleanOrderId); // Verify with Paystack reference and order ID
          },
          onClose: () => {
            toast.info("Payment cancelled. You can try again.", {
              position: "top-right",
              autoClose: 3000,
            });
            setIsProcessingPayment(false);
          },
          onError: (error) => {
            console.error("PaymentComponent: Payment error:", error);
            toast.error(`Payment failed: ${error.message}`, {
              position: "top-right",
              autoClose: 3000,
            });
            setIsProcessingPayment(false);
          },
        });
      } catch (error) {
        console.error("PaymentComponent: Payment initialization error:", error);
        toast.error("Failed to initialize payment. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsProcessingPayment(false);
      }
    } else {
      // COD: Navigate directly to order success
      navigate("/order-success", {
        state: {
          orderId: cleanOrderId,
          items,
          subtotal,
          vat,
          delivery,
          total,
          address: selectedAddress,
        },
      });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-20">
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
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-6 border border-gray-200 rounded-lg p-8">
          <div className="space-y-4">
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
            disabled={isProcessingPayment || items.length === 0}
            className={`w-full bg-[#CB5B6A] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isProcessingPayment || items.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#CB5B6A]/70"
            }`}
          >
            {isProcessingPayment ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Complete Payment</span>
            )}
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
