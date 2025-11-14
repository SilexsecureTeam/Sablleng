import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings } from "lucide-react";
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
  const navigate = useNavigate();

  // MODAL
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedOrder, setSelectedOrder] = useState(null);

  const { auth } = useContext(AuthContext);

  // ONLY THESE FILTERS
  const filters = [
    "All",
    "Paid",
    "Order Placed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  // Fetch orders
  const fetchOrders = async () => {
    if (!auth?.isAuthenticated || !auth?.token) {
      toast.error("Please log in to view orders");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.sablle.ng/api/admin/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        // const text = await response.text();
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok) {
        const mappedOrders = data.data.map((order) => {
          const status = order.status.toLowerCase();
          const displayStatus =
            order.order_status || (status === "paid" ? "Paid" : "Pending");

          // Calculate total number of items (sum of quantities)
          const totalItems = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return {
            id: order.order_reference,
            customer: order.user?.name || "Unknown",
            items: totalItems,
            total: `₦${parseFloat(order.total).toLocaleString()}`,
            status: displayStatus,
            date: new Date(order.created_at).toLocaleDateString("en-GB"),
            raw: order,
          };
        });
        setOrders(mappedOrders);
      } else {
        throw new Error(data.message || `Error ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [auth?.isAuthenticated, auth?.token]);

  // Status Style
  // Status Style - Updated with unique colors per status
  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-[#E8FAE7] text-[#01993C]"; // Green
      case "Order Placed":
        return "bg-blue-100 text-blue-700"; // Light Blue
      case "Processing":
        return "bg-yellow-100 text-yellow-700"; // Yellow
      case "Packed":
        return "bg-purple-100 text-purple-700"; // Purple
      case "Shipped":
        return "bg-indigo-100 text-indigo-700"; // Indigo
      case "Out for Delivery":
        return "bg-orange-100 text-orange-700"; // Orange
      case "Delivered":
        return "bg-green-100 text-green-800"; // Dark Green
      default:
        return "bg-[#DAD3BC] text-[#414245]"; // Fallback (Pending)
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === "All" || order.status === activeFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-7xl mx-auto">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* HEADER */}
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
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl">
          {/* TITLE */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          </div>

          {/* SEARCH */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order Reference or Customer's Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          {/* FILTERS: All, Paid, Pending */}
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

          {/* LOADING */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327]"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          )}

          {/* ERROR */}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#4A0F1F]"
              >
                Retry
              </button>
            </div>
          )}

          {/* TABLE */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.map((order, index) => (
                    <tr
                      key={startIndex + index}
                      className="hover:bg-gray-50 text-[#414245]"
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
                        <button
                          onClick={() =>
                            navigate(`/dashboard/orders/${order.id}/details`)
                          }
                          className="text-sm text-[#0B36B5] hover:text-blue-800 font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !error && paginatedOrders.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">No orders found.</p>
            </div>
          )}

          {/* PAGINATION */}
          {!isLoading && !error && filteredOrders.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
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
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
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
