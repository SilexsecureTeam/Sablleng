import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { toast } from "react-toastify";
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Loader2,
} from "lucide-react";

const Orders = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const location = useLocation();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) {
      toast.error("Please sign in to view your order history", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/signin", { state: { from: location } });
    }
  }, [auth.isAuthenticated, navigate]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.isAuthenticated || !auth.token) return;

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
        console.log("Orders: Fetched orders:", JSON.stringify(data, null, 2));
        if (response.ok && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setFilteredOrders(data.orders);
        } else {
          throw new Error(data.message || "Failed to load orders");
        }
      } catch (error) {
        console.error("Orders: Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchOrders();
    }
  }, [auth.isAuthenticated, auth.token]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search query (order_reference only)
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.order_reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />;
      case "shipped":
        return <Truck className="text-blue-600" size={20} />;
      case "processing":
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "paid":
        return <CheckCircle className="text-green-600" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Package className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (orderReference) => {
    console.log(
      "Orders: Navigating to order-success with reference:",
      orderReference
    );
    navigate(`/order-success/${orderReference}`);
  };

  return (
    <div className="bg-[#FFF2F2] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1  gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by Order Reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 hidden border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader2
              size={48}
              className="mx-auto text-[#5F1327] animate-spin mb-4"
            />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <a
                href="/product"
                className="inline-block bg-[#5F1327] text-white px-6 py-3 rounded-lg hover:bg-[#b34f5c] transition-colors duration-200"
              >
                Start Shopping
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.order_reference}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order?.order_reference?.slice(0, 7)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered on{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleViewDetails(order.order_reference)}
                        className="flex items-center gap-2 text-[#5F1327] hover:text-[#b34f5c] transition-colors duration-200"
                      >
                        <Eye size={18} />
                        <span className="text-sm font-medium">Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
