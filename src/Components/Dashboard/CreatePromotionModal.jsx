import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Wand2 } from "lucide-react";

const CreatePromotionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountType: "Percentage",
    discount: "",
    startDate: "",
    endDate: "",
    uses: 0,
    status: "Active",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount" || name === "uses" ? Number(value) : value,
    }));
  };

  const handleGenerate = () => {
    const randomCode = "SAVE" + Math.floor(Math.random() * 100);
    setFormData((prev) => ({
      ...prev,
      code: randomCode,
    }));
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      code: "",
      discountType: "Percentage",
      discount: "",
      startDate: "",
      endDate: "",
      uses: 0,
      status: "Active",
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      code: "",
      discountType: "Percentage",
      discount: "",
      startDate: "",
      endDate: "",
      uses: 0,
      status: "Active",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Create New Promotion
          </h1>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-[#B34949]"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Promotion Name */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Promotion Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g Black Friday Sales"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
              required
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Coupon Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="SAVE20"
                className="w-full px-3 py-2 pr-24 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="absolute right-1 top-1 bottom-1 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generate
              </button>
            </div>
          </div>

          {/* Discount Type and Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="discountType"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Discount Type
              </label>
              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pr-8"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Buy One Get One">Buy One Get One</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="20"
                min="0"
                max="100"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md by focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              Create Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
