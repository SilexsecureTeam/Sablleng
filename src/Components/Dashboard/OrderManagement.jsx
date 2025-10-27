import React, { useState, useEffect, useContext } from "react";
import { Search, Zap, Bell, Settings } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderManagement = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const ordersPerPage = 10;

  const { auth } = useContext(AuthContext);

  const filters = ["All", "Pending", "Delivered", "Processing", "Shipped"];

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!auth?.isAuthenticated) {
      toast.error("Please log in to view orders");
      // setTimeout(() => navigate("/admin/signin"), 2000);
      setIsLoading(false);
      return;
    }
    if (!auth?.token) {
      toast.error("Please verify OTP to continue.");
      setError("OTP verification required");
      // setTimeout(() => navigate("/admin/otp"), 2000);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "🛒 Fetching orders with token:",
        auth.token.substring(0, 20) + "..."
      );
      const response = await fetch("https://api.sablle.ng/api/admin/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: "application/json",
        },
      });

      console.log("🛒 Response status:", response.status);
      console.log("🛒 Response headers:", response.headers.get("Content-Type"));

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("🛒 Non-JSON response received:", text.substring(0, 100));
        throw new Error(
          "Server returned non-JSON response, likely an error page"
        );
      }

      const data = await response.json();
      console.log("🛒 Orders fetch response:", data);

      if (response.ok) {
        const mappedOrders = data.data.map((order) => ({
          id: order.order_reference,
          customer: order.user?.name || "Unknown",
          items: "N/A", // API doesn't provide item count
          total: `N${parseFloat(order.total).toFixed(2)}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          date: new Date(order.created_at).toISOString().split("T")[0],
        }));
        setOrders(mappedOrders);
        console.log("🛒 Orders set:", mappedOrders);
      } else {
        if (response.status === 401) {
          setError(
            "Unauthorized: Invalid or expired token. Please log in again."
          );
          toast.error("Unauthorized: Please log in again");
        } else if (response.status === 403) {
          setError("Forbidden: You lack permission to view orders.");
          toast.error("Forbidden: You lack permission to view orders");
        } else {
          setError(data.message || `Server error: ${response.status}`);
          toast.error(data.message || `Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("❌ Orders fetch error:", error.message);
      setError(error.message || "Network error while fetching orders");
      toast.error(error.message || "Network error while fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [auth?.isAuthenticated, auth?.token]);

  const getStatusStyle = (status) => {
    const styles = {
      Shipped: "bg-[#DBE8FF] text-[#001D76]",
      Processing: "bg-[#F4E8C0] text-[#414245]",
      Pending: "bg-[#DAD3BC] text-[#414245]",
      Delivered: "bg-[#E8FAE7] text-[#01993C]",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === "All" || order.status === activeFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-7xl mx-auto">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex items-start justify-between text-[#414245] mb-4">
          <div>
            <h1 className="text-2xl font-medium">Orders</h1>
            <p className="text-sm md:text-base mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#C3B7B9] text-gray-700 rounded-md hover:bg-[#C3B7B9]/80 cursor-pointer transition-colors text-sm font-medium">
              <Zap className="w-4 h-4" />
              Quick Action
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl">
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order Reference or Customer's Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-[#5F1327] text-white"
                      : "bg-[#DFDFDF] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="px-6 py-12 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchOrders} // Changed from () => fetchOrders()
                className="mt-4 px-4 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#4A0F1F] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.map((order, index) => (
                    <tr
                      key={startIndex + index}
                      className="hover:bg-gray-50 transition-colors text-[#414245]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-sm text-[#0B36B5] hover:text-blue-800 font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && paginatedOrders.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">
                No orders found matching your criteria.
              </p>
            </div>
          )}

          {!isLoading && !error && filteredOrders.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
