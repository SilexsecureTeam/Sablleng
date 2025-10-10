import React from "react";
import { Bell, Settings, Zap } from "lucide-react";

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Tech Gadgets",
      description: "USB drives, cables, and accessories",
      productCount: 21,
      status: "Active",
    },
    {
      id: 2,
      name: "Drinkware",
      description: "Mugs, bottles, and tumblers",
      productCount: 36,
      status: "Active",
    },
    {
      id: 3,
      name: "Stationery",
      description: "Pens, notebooks, and office supplies",
      productCount: 45,
      status: "Active",
    },
    {
      id: 4,
      name: "Apparel",
      description: "USB drives, cables, and accessories",
      productCount: 21,
      status: "Active",
    },
    {
      id: 5,
      name: "Tech Gadgets",
      description: "USB drives, cables, and accessories",
      productCount: 21,
      status: "Active",
    },
    {
      id: 6,
      name: "Tech Gadgets",
      description: "USB drives, cables, and accessories",
      productCount: 21,
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5]  p-6">
      {/* Top Navigation Bar */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#C3B7B9] text-gray-700 rounded-md hover:bg-[#C3B7B9]/80 cursor-pointer transition-colors text-sm font-medium">
          <Zap className="w-4 h-4" />
          Quick Action
        </button>
        <button className="relative p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[#414245] mb-6">
          Products Category
        </h1>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white"
            >
              {/* Active Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-[#EAFFD8] text-[#1B8401] text-xs font-medium rounded">
                  {category.status}
                </span>
              </div>

              {/* Category Content */}
              <div className="pr-16">
                <h2 className="text-base font-semibold text-[#414245] mb-1">
                  {category.name}
                </h2>
                <p className="text-sm text-[#414245] mb-4">
                  {category.description}
                </p>
                <p className="text-sm font-medium text-[#414245]">
                  {category.productCount} products
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Categories;
