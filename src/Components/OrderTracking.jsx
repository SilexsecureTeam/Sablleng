import React, { useState, useEffect } from "react";
import { Check, Mail, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";

const OrderTracking = () => {
  const location = useLocation();
  const { orderId, address } = location.state || {};
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("");

  // Simulate fetching tracking data
  useEffect(() => {
    const fetchTrackingData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Mock API response (replace with real API call if available)
        const mockData = [
          {
            id: 1,
            title: "Order Placed",
            description: "We have received your order",
            status: "completed",
            time: "01/08/2025, 10:37:52",
          },
          {
            id: 2,
            title: "Processing",
            description: "Checking your payment and other facilities",
            status: "completed",
            time: "01/08/2025, 12:15:30",
          },
          {
            id: 3,
            title: "Packed",
            description: "We have packed and ready to ship",
            status: "completed",
            time: "02/08/2025, 09:00:00",
          },
          {
            id: 4,
            title: "Shipped",
            description: "Package has left our facility",
            status: "current",
            time: "02/08/2025, 14:20:00",
          },
          {
            id: 5,
            title: "Out for Delivery",
            description: "Driver is on the way to you",
            status: "pending",
          },
          {
            id: 6,
            title: "Delivered",
            description: "Package delivered. Thank you!",
            status: "pending",
          },
        ];
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTrackingSteps(mockData);
      } catch {
        setError("Failed to load tracking information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrackingData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate form submission (replace with real API call)
    setTimeout(() => {
      if (contactForm.email && contactForm.message) {
        setFormStatus("success");
        setTimeout(() => {
          setShowContactModal(false);
          setContactForm({ name: "", email: "", message: "" });
          setFormStatus("");
        }, 2000);
      } else {
        setFormStatus("error");
      }
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 my-8">
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
          Order Tracking
        </h2>
        <p className="text-sm text-gray-600">
          Order ID: {orderId || "SABIL-20250829-2724"}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading tracking...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
          {error}
        </div>
      )}

      {/* Tracking Steps */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <div className="space-y-1 mb-6">
            <p className="text-sm font-medium text-gray-900">
              Order ID: {orderId || "SABIL-20250829-2724"}
            </p>
            <p className="text-xs text-gray-500">Status Timeline</p>
          </div>
          <div className="relative">
            {trackingSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-start space-x-4 pb-6 last:pb-0 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {index < trackingSteps.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-12 ${
                      step.status === "completed" || step.status === "current"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === "completed"
                      ? "bg-green-500 text-white"
                      : step.status === "current"
                      ? "bg-[#CB5B6A] text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                  {step.time && (
                    <p className="text-xs text-gray-400 mt-1">{step.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
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
        </div>
      )}

      {/* Contact Support Button */}
      <button
        onClick={() => setShowContactModal(true)}
        className="w-full mt-6 bg-[#CB5B6A] hover:bg-[#CB5B6A]/80 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        aria-label="Contact support"
      >
        <Mail size={16} />
        Contact Support
      </button>

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Support
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close contact form"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                  rows="4"
                  placeholder="Describe your issue or question"
                  required
                ></textarea>
              </div>
              {formStatus === "error" && (
                <p className="text-red-500 text-sm">
                  Please fill in all required fields.
                </p>
              )}
              {formStatus === "success" && (
                <p
                  className="text-green-500 text-smთ

System: sm"
                >
                  Your message has been sent successfully!
                </p>
              )}
              <button
                type="submit"
                disabled={formStatus === "submitting"}
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  formStatus === "submitting"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#CB5B6A] hover:bg-[#CB5B6A]/80"
                }`}
              >
                {formStatus === "submitting" ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
