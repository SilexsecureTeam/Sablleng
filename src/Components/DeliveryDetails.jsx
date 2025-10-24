import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryDetail = () => {
  const { auth } = useContext(AuthContext);
  const { items, total, cart_session_id } = useContext(CartContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: "",
    delivery_fee: 0,
    tax_rate: 7.5,
  });
  const [errors, setErrors] = useState({});

  // Dropdown states
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const API_BASE = "https://api.sablle.ng/api";

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      fetchLgas(selectedState);
    } else {
      setLgas([]);
      setSelectedLga("");
      setPlaces([]);
      setSelectedPlace("");
      setFormData((prev) => ({
        ...prev,
        shipping_address: "",
        delivery_fee: 0,
      }));
    }
  }, [selectedState]);

  // Fetch places when LGA changes
  useEffect(() => {
    if (selectedLga && selectedState) {
      fetchPlaces(selectedState, selectedLga);
    } else {
      setPlaces([]);
      setSelectedPlace("");
      setFormData((prev) => ({
        ...prev,
        shipping_address: "",
        delivery_fee: 0,
      }));
    }
  }, [selectedLga, selectedState]);

  // Update formData when place changes
  useEffect(() => {
    if (selectedPlace) {
      const fullAddress = `${selectedPlace}, ${selectedLga}, ${selectedState}`;
      const fee = places.find((p) => p.places === selectedPlace)?.fee || 0;
      setFormData((prev) => ({
        ...prev,
        shipping_address: fullAddress,
        delivery_fee: parseFloat(fee),
      }));
    }
  }, [selectedPlace, selectedLga, selectedState, places]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await fetch(`${API_BASE}/states`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setStates(data);
        // Optional: Pre-select Abuja if in list
        if (data.some((s) => s.state_name.toLowerCase() === "abuja")) {
          setSelectedState("Abuja");
        }
      } else {
        toast.error("Failed to load states");
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Network error loading states");
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchLgas = async (state) => {
    setLoadingLgas(true);
    try {
      const response = await fetch(
        `${API_BASE}/lgas/${encodeURIComponent(state)}`
      );
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setLgas(data);
      } else {
        toast.error(`Failed to load LGAs for ${state}`);
        setLgas([]);
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error);
      toast.error("Network error loading LGAs");
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const fetchPlaces = async (state, lga) => {
    setLoadingPlaces(true);
    try {
      const response = await fetch(
        `${API_BASE}/places/${encodeURIComponent(state)}/${encodeURIComponent(
          lga
        )}`
      );
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setPlaces(data);
      } else {
        toast.error(`Failed to load places for ${lga}, ${state}`);
        setPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Network error loading places");
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Debug logging on mount (unchanged)
  useEffect(() => {
    console.log("\n=== CHECKOUT PAGE LOADED ===");
    console.log("Cart items:", items);
    console.log("Cart total:", total);
    console.log("Items count:", items?.length || 0);
    console.log("Auth state:", {
      isAuthenticated: auth?.isAuthenticated,
      hasToken: !!auth?.token,
      tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
      user: auth?.user?.name || auth?.user?.email,
    });
    console.log("Session ID:", cart_session_id);
    console.log("=========================\n");
  }, [items, total, auth, cart_session_id]);

  const validateForm = () => {
    const newErrors = {};
    if (
      !formData.shipping_address.trim() ||
      !selectedState ||
      !selectedLga ||
      !selectedPlace
    ) {
      newErrors.shipping_address = "Please select State, LGA, and Place/City";
    }
    if (!formData.delivery_fee || formData.delivery_fee < 0) {
      newErrors.delivery_fee = "Delivery fee must be a valid number";
    }
    if (!formData.tax_rate || formData.tax_rate < 0) {
      newErrors.tax_rate = "Tax rate must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("\n=== CHECKOUT SUBMISSION ===");
    console.log("Form Data:", formData);

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    // Check authentication
    if (!auth?.isAuthenticated || !auth?.token) {
      console.log("❌ User not authenticated");
      toast.error("You must be logged in to checkout");
      navigate("/signin");
      return;
    }

    // Check cart
    if (!items || items.length === 0) {
      console.log("❌ Cart is empty");
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    console.log("✅ Validation passed");
    console.log("Items in cart:", items.length);
    console.log("Token available:", auth.token.substring(0, 20) + "...");

    setIsLoading(true);

    try {
      const payload = {
        shipping_address: formData.shipping_address,
        delivery_fee: formData.delivery_fee,
        tax_rate: parseFloat(formData.tax_rate),
      };

      console.log("Request payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("https://api.sablle.ng/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", JSON.stringify(data, null, 2));

      // Log the order reference for testing
      console.log("=== ORDER REFERENCE FOR TESTING ===");
      console.log(
        "order_reference:",
        data.order?.order_reference || "Not found in response"
      );
      console.log("=================================\n");

      if (response.ok) {
        console.log("✅ Checkout successful");
        toast.success("Checkout submitted! Proceeding to payment.");

        navigate("/payment", {
          state: {
            selectedDelivery: {
              value: formData.delivery_fee,
              shipping_address: formData.shipping_address,
              tax_rate: parseFloat(formData.tax_rate),
              orderData: data.order,
            },
          },
        });
      } else {
        console.error("❌ Checkout failed:", data);

        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/signin");
        } else if (response.status === 400 && data.message?.includes("cart")) {
          toast.error(
            "Your cart appears to be empty on the server. Please try adding items again."
          );
        } else {
          toast.error(
            data.message || "Failed to process checkout. Please try again."
          );
        }

        setErrors({
          ...errors,
          api: data.message || "An error occurred during checkout.",
        });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      toast.error("Network error. Please check your connection and try again.");
      setErrors({
        ...errors,
        api: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
      console.log("=========================\n");
    }
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "₦--";
    return `₦${numericPrice.toLocaleString()}`;
  };

  const fullAddress = formData.shipping_address || "";

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Delivery Details
        </h1>
        <p className="text-gray-600 mt-2">
          Complete your order by providing delivery information
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.api && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="ml-3 text-sm text-red-800">{errors.api}</p>
                  </div>
                </div>
              )}

              {/* Chained Dropdowns for Address */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Shipping Address
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* State Dropdown */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      State
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent transition-all"
                      disabled={isLoading || loadingStates}
                    >
                      <option value="">Select State</option>
                      {loadingStates ? (
                        <option disabled>Loading states...</option>
                      ) : (
                        states.map((state) => (
                          <option
                            key={state.state_name}
                            value={state.state_name}
                          >
                            {state.state_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* LGA Dropdown */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      LGA
                    </label>
                    <select
                      value={selectedLga}
                      onChange={(e) => setSelectedLga(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent transition-all"
                      disabled={isLoading || !selectedState || loadingLgas}
                    >
                      <option value="">Select LGA</option>
                      {loadingLgas ? (
                        <option disabled>Loading LGAs...</option>
                      ) : (
                        lgas.map((lga) => (
                          <option key={lga.lga_name} value={lga.lga_name}>
                            {lga.lga_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Place/City Dropdown */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Place/City
                    </label>
                    <select
                      value={selectedPlace}
                      onChange={(e) => setSelectedPlace(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent transition-all"
                      disabled={isLoading || !selectedLga || loadingPlaces}
                    >
                      <option value="">Select Place/City</option>
                      {loadingPlaces ? (
                        <option disabled>Loading places...</option>
                      ) : (
                        places.map((placeObj) => (
                          <option key={placeObj.places} value={placeObj.places}>
                            {placeObj.places}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Delivery Fee (₦)
                    </label>
                    <input
                      type="number"
                      name="delivery_fee"
                      value={formData.delivery_fee}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent transition-all"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                    {errors.delivery_fee && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.delivery_fee}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-updated based on location
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="tax_rate"
                      value={formData.tax_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent transition-all"
                      min="0"
                      step="0.01"
                      required
                      disabled={isLoading}
                    />
                    {errors.tax_rate && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.tax_rate}
                      </p>
                    )}
                  </div>
                </div>
                {fullAddress && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    Selected: {fullAddress}
                  </p>
                )}
                {errors.shipping_address && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.shipping_address}
                  </p>
                )}
              </div>

              {/* <div className="grid sm:grid-cols-2 gap-6">

              </div> */}

              <button
                type="submit"
                className="w-full bg-[#CB5B6A] text-white py-4 px-6 rounded-lg font-semibold text-base hover:bg-[#B54F5E] active:bg-[#A0444F] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                disabled={isLoading || items.length === 0 || !fullAddress}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Payment →"
                )}
              </button>

              {items.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-amber-800 text-sm font-medium">
                    ⚠️ Please add items to your cart before proceeding
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-[#CB5B6A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Order Summary
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-4">Your cart is empty</p>
                <button
                  onClick={() => navigate("/product")}
                  className="text-[#CB5B6A] hover:text-[#B54F5E] text-sm font-semibold hover:underline transition-colors"
                >
                  Continue Shopping →
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={
                            item.image ||
                            item.product?.image ||
                            "/placeholder-image.jpg"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.name || item.product?.name || "Unknown Product"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(formData.delivery_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Tax ({formData.tax_rate}%)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice((total * formData.tax_rate) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-[#CB5B6A]">
                      {formatPrice(
                        total +
                          formData.delivery_fee +
                          (total * formData.tax_rate) / 100
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Final pricing will be confirmed at
                    checkout
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;
