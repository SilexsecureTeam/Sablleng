import React from "react";
import { ArrowUpRight, Circle } from "lucide-react";

const DashboardHome = () => {
  const metrics = [
    { label: "Total Revenue", value: "₦0", extra: "↑ 12.5% vs last month" },
    { label: "This Month", value: "₦0", extra: "Last 7 days" },
    { label: "Total Orders", value: "960", extra: "Last 7 days" },
    { label: "Low Stock", value: "7" },
  ];

  const recentActivity = [
    { text: "New order placed", time: "John Doe • 2 minutes ago" },
    { text: "Product added", time: "Admin • 1 hour ago" },
    { text: "Customization approved", time: "Jane Smith • 3 hours ago" },
    { text: "Low stock alert", time: "System • 5 hours ago" },
  ];

  const goals = [
    { name: "Pending Orders", value: 45, color: "bg-[#3C4ADD]", width: "60%" },
    { name: "Low Stock Items", value: 12, color: "bg-[#F8650A]", width: "30%" },
    {
      name: "Pending Customizations",
      value: 18,
      color: "bg-[#16CF0C]",
      width: "45%",
    },
  ];

  const orders = [
    {
      orderId: "P001",
      customer: "Acme Corp",
      total: "₦120,000",
      status: "Processing",
      statusColor: "bg-[#FFE4CC] text-[#AD5507]",
      date: "2025-09-28",
    },
    {
      orderId: "P001",
      customer: "Beta Ltd",
      total: "₦120,000",
      status: "Shipped",
      statusColor: "bg-[#E0FBEC] text-[#079722]",
      date: "2025-09-28",
    },
    {
      orderId: "P001",
      customer: "Delta Inc",
      total: "₦120,000",
      status: "Awaiting Customization",
      statusColor: "bg-[#E5EAFF] text-[#143AAD]",
      date: "2025-09-28",
    },
    {
      orderId: "P001",
      customer: "RH-PEC",
      total: "₦120,000",
      status: "Shipped",
      statusColor: "bg-[#E0FBEC] text-[#079722]",
      date: "2025-09-28",
    },
  ];

  const requests = [
    {
      id: 1,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Pending",
      previewColor: "text-amber-600",
      status: "Pending Design",
      statusColor: "text-purple-600",
      bulletColor: "fill-amber-600 text-amber-600",
    },
    {
      id: 2,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Uploaded",
      previewColor: "text-cyan-600",
      status: "Awaiting Approval",
      statusColor: "text-amber-600",
      bulletColor: "fill-cyan-600 text-cyan-600",
    },
    {
      id: 3,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Pending",
      previewColor: "text-amber-600",
      status: "Pending Design",
      statusColor: "text-purple-600",
      bulletColor: "fill-amber-600 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#414245] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-medium">Dashboard Overview</h1>
            <p className="text-sm md:text-base  mt-1">
              Welcome back! Here's what's happening with your store today
            </p>
          </div>
          <button className="flex items-center gap-1  text-sm font-medium bg-white px-4 py-2 rounded ">
            New Category
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 mt-6">
          {metrics.map((metric, idx) => {
            // Determine color based on text content
            const extraColor = metric.extra?.includes("↑")
              ? "text-green-600"
              : metric.extra?.includes("↓")
              ? "text-red-600"
              : "text-[#23272E]";

            return (
              <div key={idx} className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-lg text-[#23272E] mb-2">{metric.label}</p>
                <p className="text-xl font-semibold text-[#23272E]">
                  {metric.value}
                </p>
                {metric.extra && (
                  <p className={`text-xs mt-1 ${extraColor}`}>{metric.extra}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Goals */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#23272E] mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Circle className="w-1.5 h-1.5 fill-[#6460D4] text-[#6460D4] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#575757]">{activity.text}</p>
                    <p className="text-xs text-[#A7ABB2]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals/Tasks */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#23272E] mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm text-gray-700">{goal.name}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {goal.value}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${goal.color} h-2 rounded-full transition-all`}
                      style={{ width: goal.width }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white text-[#414245] rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold  mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 px-4">
                    Order
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 px-4">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 px-4">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 px-4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4 text-sm ">{order.orderId}</td>
                    <td className="py-3 px-4 text-sm ">{order.customer}</td>
                    <td className="py-3 px-4 text-sm ">{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm ">{order.date}</td>
                    <td className="py-3 px-4 text-sm text-[#0029A3]">
                      Details
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customization Requests */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#414245] mb-4">
            Customization Requests
          </h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 p-6 duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Left section - Company and Item info */}
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium mb-1">
                      {request.company}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Item:{" "}
                      <span className="font-semibold text-gray-900">
                        {request.item}
                      </span>
                    </div>
                  </div>

                  {/* Middle section - Preview and Status */}
                  <div className="flex-1 px-8">
                    <div className="flex items-center gap-2 mb-1">
                      <Circle className={`w-2 h-2 ${request.bulletColor}`} />
                      <span className="text-sm">
                        <span className={request.previewColor}>
                          Preview: {request.preview}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className={`w-2 h-2 ${request.bulletColor}`} />
                      <span className="text-sm">
                        <span className="text-gray-600">Status: </span>
                        <span className={request.statusColor}>
                          {request.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right section - Action buttons */}
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors duration-150">
                      Approve
                    </button>
                    <button className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors duration-150">
                      Request Change
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
