import React, { useState, useEffect } from "react";
import { Search, Settings, Zap, Bell } from "lucide-react";

const Inventory = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const inventoryData = [
    {
      product: "Branded Pen",
      sku: "BP-001",
      stock: 320,
      reorderPoint: "< 50",
      lastRestocked: "2025-08-28",
      status: "In Stock",
    },
    {
      product: "Corporate Mug",
      sku: "BP-002",
      stock: 30,
      reorderPoint: "< 100",
      lastRestocked: "2025-08-28",
      status: "Low Stock",
    },
    {
      product: "USB Drive",
      sku: "BP-003",
      stock: 320,
      reorderPoint: "< 50",
      lastRestocked: "2025-09-28",
      status: "In Stock",
    },
    {
      product: "Branded Pen",
      sku: "BP-004",
      stock: 320,
      reorderPoint: "< 50",
      lastRestocked: "2025-08-28",
      status: "Low Stock",
    },
    {
      product: "Notebook",
      sku: "BP-005",
      stock: 320,
      reorderPoint: "< 50",
      lastRestocked: "2025-08-28",
      status: "In Stock",
    },
    {
      product: "Branded Pen",
      sku: "BP-006",
      stock: 320,
      reorderPoint: "< 50",
      lastRestocked: "2025-08-28",
      status: "In Stock",
    },
  ];

  const getFilteredData = () => {
    let filtered = inventoryData;

    if (activeFilter === "instock") {
      filtered = filtered.filter((item) => item.status === "In Stock");
    } else if (activeFilter === "outofstock") {
      filtered = filtered.filter((item) => item.status === "Low Stock");
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Pagination logic
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-[#FAF7F5]">
      <div className="px-10 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1">
              Inventory
            </h1>
            <p className="text-[13px] text-[#6b7280]">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search by Name or SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-full text-sm text-[#1f2937] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c1d1d]/20 focus:border-[#7c1d1d]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === "all"
                  ? "bg-[#5F1327] text-white"
                  : "bg-[#DFDFDF] text-[#4b5563] hover:bg-[#d1d5db]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("instock")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === "instock"
                  ? "bg-[#5F1327] text-white"
                  : "bg-[#DFDFDF] text-[#4b5563] hover:bg-[#d1d5db]"
              }`}
            >
              Instock
            </button>
            <button
              onClick={() => setActiveFilter("outofstock")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === "outofstock"
                  ? "bg-[#5F1327] text-white"
                  : "bg-[#DFDFDF] text-[#4b5563] hover:bg-[#d1d5db]"
              }`}
            >
              Out of stock
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    Product
                  </th>
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    SKU
                  </th>
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    Stock
                  </th>
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    Reorder Point
                  </th>
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    Last Restocked
                  </th>
                  <th className="text-left py-3 px-3 text-[13px] font-medium text-[#4b5563]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={startIndex + index}
                    className="border-b border-[#f3f4f6] hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-3 text-sm text-[#414245]">
                      {item.product}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#414245]">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#414245]">
                      {item.stock}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#414245]">
                      {item.reorderPoint}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-[#414245]">
                      {item.lastRestocked}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-sm font-medium ${
                          item.status === "In Stock"
                            ? "text-[#069E22]"
                            : "text-[#B81C07]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-[#e5e7eb]">
              <p className="text-sm text-[#4b5563]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border border-[#e5e7eb] rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#4b5563] hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border border-[#e5e7eb] rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#4b5563] hover:bg-gray-50"
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

export default Inventory;
