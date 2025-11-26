import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Mail, Phone, Calendar, Loader2 } from "lucide-react";

const MyProfile = () => {
  const { auth } = useContext(AuthContext);
  const { wishlist } = useContext(CartContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0) + (nameParts[1]?.charAt(0) || "")
    ).toUpperCase();
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) {
      // toast.error("Please sign in to view your profile", {
      //   position: "top-right",
      //   autoClose: 3000,
      // });
      navigate("/signin");
    }
  }, [auth.isAuthenticated, navigate]);

  // Initialize profile data with auth data from API
  useEffect(() => {
    if (auth.user) {
      setProfileData({
        name: auth.user.name || "N/A",
        email: auth.user.email || "N/A",
        phone: auth.user.phone || "N/A",
      });
    }
  }, [auth.user]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.isAuthenticated || !auth.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        console.log(
          "MyProfile: Fetched orders:",
          JSON.stringify(data, null, 2)
        );
        if (response.ok && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          throw new Error(data.message || "Failed to load orders");
        }
      } catch (error) {
        console.error("MyProfile: Error fetching orders:", error);
        setError(error.message);
        // toast.error("Failed to load orders. Please try again.", {
        //   position: "top-right",
        //   autoClose: 5000,
        // });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchOrders();
    }
  }, [auth.isAuthenticated, auth.token]);

  return (
    <div className="bg-[#FFF2F2] min-h-screen py-8">
      {/* <ToastContainer /> */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#5F1327] to-[#b34f5c] p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#5F1327] font-bold text-3xl flex-shrink-0 shadow-lg">
                {getInitials(profileData.name)}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {profileData.name || "User"}
                </h2>
                <p className="text-white/90 mt-1">
                  {profileData.email || "N/A"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={16} />
                  <span className="text-sm">
                    Member since{" "}
                    {auth.user?.created_at
                      ? new Date(auth.user.created_at).getFullYear()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h3>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {profileData.name}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {profileData.email}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {profileData.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">Account Status</h4>
            <p className="text-green-600 font-medium">Active</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">Total Orders</h4>
            <p className="text-[#5F1327] font-medium text-2xl">
              {isLoading ? (
                <Loader2 size={24} className="animate-spin text-[#5F1327]" />
              ) : error ? (
                "Error"
              ) : (
                orders.length
              )}
            </p>
            <a
              href="/orders"
              className="text-[#5F1327] hover:underline text-sm mt-2 inline-block"
            >
              View Orders
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">Wishlist Items</h4>
            <p className="text-[#5F1327] font-medium text-2xl">
              {wishlist.length}
            </p>
            <a
              href="/wishlist"
              className="text-[#5F1327] hover:underline text-sm mt-2 inline-block"
            >
              View Wishlist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
