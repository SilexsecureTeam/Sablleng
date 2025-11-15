import React, { useState } from "react";
import { ChevronDown, CreditCard } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Sales");

  const tabs = ["Sales", "Products", "Customers", "Inventory"];

  const metrics = [
    {
      label: "Total Sales",
      value: "20,000,000",
      change: "+23.5% vs Previous 30 days",
      positive: true,
    },
    {
      label: "Total Orders",
      value: "120",
      change: "8.2% vs vs Previous 30 days",
      positive: true,
    },
    {
      label: "New Customers",
      value: "100",
      change: "+65.0% vs Previous 30 days",
      positive: true,
    },
  ];

  const products = [
    { name: "Branded Pen", unitsSold: 80, price: 2500, revenue: 200000 },
    { name: "Corporate Mug", unitsSold: 80, price: 2500, revenue: 200000 },
    { name: "Branded Pen", unitsSold: 80, price: 2500, revenue: 200000 },
  ];

  // Chart data points for the line
  const chartPoints = [
    { x: 8, y: 85 },
    { x: 15, y: 82 },
    { x: 22, y: 80 },
    { x: 30, y: 78 },
    { x: 38, y: 83 },
    { x: 48, y: 75 },
    { x: 58, y: 72 },
    { x: 68, y: 70 },
    { x: 78, y: 68 },
    { x: 88, y: 65 },
    { x: 100, y: 55 },
    { x: 112, y: 48 },
    { x: 125, y: 42 },
    { x: 140, y: 35 },
    { x: 158, y: 25 },
    { x: 175, y: 15 },
  ];

  const pathData = chartPoints
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metric.value}
              </div>
              <div
                className={`text-xs ${
                  metric.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section with Payment Card Overlay */}
        <div className="relative mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Month Selector */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-semibold text-gray-900">
                October
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            {/* Chart */}
            <div className="relative h-48">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-4">
                <span>$20k</span>
                <span>$15k</span>
                <span>$10k</span>
                <span>$5k</span>
                <span>$0</span>
              </div>

              {/* Chart area */}
              <div className="ml-12 h-full relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 180 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#1F2937"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                  <span>First Week</span>
                  <span>Second Week</span>
                  <span>Last Week</span>
                  <span>Third Week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Card Overlay */}
          <div className="absolute right-6 top-6 bg-gradient-to-br from-[#7C2D3E] to-[#5A1F2E] rounded-xl p-6 w-80 shadow-lg">
            <div className="text-white mb-4">
              <div className="text-sm font-medium mb-3">Payment</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-400 opacity-80"></div>
                <div className="w-10 h-10 rounded-full bg-pink-300 opacity-80 -ml-5"></div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>370+ m2 of Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>370 Static Transfer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Export Reports
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Download detailed reports in various formats
          </div>
          <div className="flex gap-3">
            <button className="bg-[#7C2D3E] hover:bg-[#6A2635] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors">
              Export CSV
            </button>
            <button className="bg-[#D4B5BB] hover:bg-[#C9A5AC] text-[#7C2D3E] text-sm font-medium px-6 py-2.5 rounded-md transition-colors">
              Export PDF
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">
              Top Selling Products
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                  Unit Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                  Total Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.unitsSold}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
