import React, { useState, useEffect } from "react";
import { Search, Zap, Bell, Settings } from "lucide-react";

const OrderManagement = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  const orders = [
    {
      id: "#1001",
      customer: "Jane Doe",
      items: 3,
      total: "N120.00",
      status: "Shipped",
      date: "2025-10-05",
    },
    {
      id: "#1002",
      customer: "Jane Doe",
      items: 3,
      total: "N120.00",
      status: "Processing",
      date: "2025-10-05",
    },
    {
      id: "#1003",
      customer: "Jane Doe",
      items: 3,
      total: "N120.00",
      status: "Pending",
      date: "2025-10-05",
    },
    {
      id: "#1004",
      customer: "Jane Doe",
      items: 3,
      total: "N120.00",
      status: "Delivered",
      date: "2025-10-05",
    },
    {
      id: "#1005",
      customer: "Jane Doe",
      items: 3,
      total: "N120.00",
      status: "Processing",
      date: "2025-10-05",
    },
  ];

  const filters = ["All", "Pending", "Delivered", "Processing", "Shipped"];

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
        {/* Header */}
        <div className="flex items-start justify-between text-[#414245] mb-4">
          <div>
            <h1 className="text-2xl font-medium">Orders</h1>
            <p className="text-sm md:text-base mt-1">
              Wednesday, October 6, 2025
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

        {/* Main Card */}
        <div className="bg-white rounded-xl">
          {/* Card Header */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Products ID or Customer's Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
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

          {/* Table */}
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

          {/* Empty State */}
          {paginatedOrders.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">
                No orders found matching your criteria.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
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
