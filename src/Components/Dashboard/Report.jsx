import React from "react";
import { Bell, Settings, Zap } from "lucide-react";

const Report = () => {
  const metrics = [
    {
      title: "Sales Report",
      subtitle: "October 2025",
      value: "20,000,000",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Product Performance",
      subtitle: "Last 30 Days",
      value: "145 products",
      change: "+5 items",
      changeType: "positive",
    },
    {
      title: "Customer Growth",
      subtitle: "This Quarter",
      value: "234 customers",
      change: "+23.1%",
      changeType: "positive",
    },
    {
      title: "Order Fulfillment",
      subtitle: "This Month",
      value: "96.5%",
      change: "96.5%",
      changeType: "neutral",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#414245] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium">Promotions</h1>
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

        {/* Reports Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-base font-medium mb-6">Reports</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-gray-200 "
              >
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {metric.subtitle}
                  </p>

                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-semibold text-gray-800">
                      {metric.value}
                    </p>

                    <span
                      className={`text-sm font-medium ${
                        metric.changeType === "positive"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Export Reports Section */}
          <div className=" py-6 mt-8 ">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Export Reports
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Download detailed reports in various formats
              </p>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-[#5F1327] hover:bg-[#5F1327]/80 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                Export CSV
              </button>
              <button className="px-6 py-2.5 bg-[#D3B4BC] hover:bg-[#D3B4BC]/80 text-[#5F1327] rounded-md text-sm font-medium transition-colors shadow-sm">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
