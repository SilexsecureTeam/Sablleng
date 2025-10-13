import React, { useState } from "react";
import { Plus } from "lucide-react";
// import PromotionCard from "./PromotionCard";
import CreatePromotionModal from "./CreatePromotionModal";

const PromotionCard = ({
  title,
  code,
  discount,
  startDate,
  endDate,
  uses,
  status,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm text-[#333333] mb-1">{title}</h3>
          <p className="text-xs text-[#333333]">{code}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EAFFD8] text-[#1B8401]">
          {status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-[#333333]">{discount}%</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-[#5E5E5E]">Start: {startDate}</p>
        <p className="text-xs text-[#5E5E5E]">End: {endDate}</p>
        <p className="text-xs text-[#333333] font-medium mt-2">{uses} uses</p>
      </div>
    </div>
  );
};

const CouponCode = () => {
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
    {
      id: 2,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
    {
      id: 3,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
    {
      id: 4,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
    {
      id: 5,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
    {
      id: 6,
      title: "Christmas Sales",
      code: "Xmas25",
      discount: 20,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      uses: 45,
      status: "Active",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePromotion = (newPromotion) => {
    setPromotions((prev) => [
      ...prev,
      {
        ...newPromotion,
        id: prev.length + 1, // Simple ID generation; consider UUID for production
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#414245]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium">Promotions</h1>
              <p className="text-sm md:text-base mt-1">
                Wednesday, October 6, 2025
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#B34949] text-white rounded-md hover:bg-[#B34949]/80 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={18} />
              Create Promotion
            </button>
          </div>
        </div>

        {/* Promotions Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-base font-medium mb-6">Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                title={promo.title}
                code={promo.code}
                discount={promo.discount}
                startDate={promo.startDate}
                endDate={promo.endDate}
                uses={promo.uses}
                status={promo.status}
              />
            ))}
          </div>
        </div>
      </div>
      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePromotion}
      />
    </div>
  );
};

export default CouponCode;
