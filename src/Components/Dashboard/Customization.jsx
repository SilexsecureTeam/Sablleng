import React, { useState } from "react";
import { Bell, Settings, Zap } from "lucide-react";

const Customization = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Pending",
      status: "Proofing Design",
      statusColor: "text-orange-500",
      previewColor: "text-orange-500",
    },
    {
      id: 2,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Uploaded",
      status: "Awaiting Approval",
      statusColor: "text-emerald-500",
      previewColor: "text-emerald-500",
    },
    {
      id: 3,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Pending",
      status: "Proofing Design",
      statusColor: "text-orange-500",
      previewColor: "text-orange-500",
    },
    {
      id: 4,
      company: "Acme Corp",
      item: "Leather Portfolio",
      preview: "Uploaded",
      status: "Awaiting Approval",
      statusColor: "text-emerald-500",
      previewColor: "text-emerald-500",
    },
  ]);

  const handleApprove = (id) => {
    console.log(`Approved request ${id}`);
    // Update state logic would go here
  };

  const handleRequestChange = (id) => {
    console.log(`Requesting change for ${id}`);
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id
          ? { ...request, preview: "Requested Change" }
          : request
      )
    );
    // Open modal/form logic would go here
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#414245] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customization</h1>
            <p className="text-xs text-gray-500 mt-1">
              Friday, October 10, 2025
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors">
              <Zap className="w-4 h-4" />
              Quick Action
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-base font-semibold mb-6">Customization</h2>

          <h3 className="text-sm font-medium mb-4">Customization Requests</h3>

          {/* Requests List */}
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
              >
                {/* Left Section - Company & Item Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {request.company}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Item: {request.item}
                  </p>
                </div>

                {/* Middle Section - Status */}
                <div className="flex-1 px-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium ${request.previewColor}`}
                    >
                      Preview: {request.preview}
                    </span>
                    <span className="text-gray-400">•</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs ${request.statusColor}`}>
                      Status: {request.status}
                    </span>
                  </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-6 py-2 bg-green-200 hover:bg-green-300 text-green-800 rounded-md text-sm font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequestChange(request.id)}
                    className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-md text-sm font-medium transition-colors"
                  >
                    Request Change
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customization;
