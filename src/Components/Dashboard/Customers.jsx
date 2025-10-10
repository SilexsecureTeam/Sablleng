import React, { useState, useEffect } from "react";
import { Search, Settings, Zap, Bell } from "lucide-react";

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 8;

  // Sample customer data matching the mockup
  const customers = [
    {
      id: 1,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 3,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 4,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 5,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 6,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦120,000",
      jobDate: "2025-10-05",
    },
    {
      id: 7,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦250,000",
      jobDate: "2025-10-05",
    },
    {
      id: 8,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "07063673967",
      orders: 8,
      totalSpent: "₦250,000",
      jobDate: "2025-10-05",
    },
  ];

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const startIndex = (currentPage - 1) * customersPerPage;
  const endIndex = startIndex + customersPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
            <h1 className="text-2xl font-medium">Customers</h1>
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

        {/* Main Content Card */}
        <div className="bg-white rounded-lg">
          {/* Tab */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Phone number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Job Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCustomers.map((customer, index) => (
                  <tr
                    key={startIndex + index}
                    className="hover:bg-gray-50 transition-colors text-[#414245]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.totalSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {customer.jobDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State (if no results) */}
          {paginatedCustomers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                No customers found matching your search.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredCustomers.length > 0 && (
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

export default Customers;
