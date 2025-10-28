import React from "react";
import { ArrowRight } from "lucide-react";
import black from "../assets/black.png";

const Gift = () => {
  return (
    <div className="bg-[#F0E1E1] py-8 sm:py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Badge */}
        <div className="inline-flex items-center px-6 sm:px-8 py-2 bg-[#41424533] rounded-full mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm text-white">
            Corporate Solutions
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-[#1E1E1E] leading-tight">
                Elevate Your
              </h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal leading-tight">
                <span className="text-[#5F1327]">Corporate</span>{" "}
                <span className="text-[#1E1E1E]">Relationships</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-[#555555] text-sm sm:text-base md:text-lg leading-relaxed max-w-md sm:max-w-lg">
              Transform your business relationships with our premium corporate
              gifting solutions. From client appreciation to employee
              recognition, we create memorable experiences that strengthen your
              brand presence.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
              {/* Custom Branding */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base sm:text-lg text-[#575757]">
                  Custom Branding
                </h3>
                <p className="text-sm sm:text-base text-[#575757] leading-relaxed">
                  Your logo and brand colors on premium packaging and products
                </p>
              </div>

              {/* Bulk Orders */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base sm:text-lg text-[#575757]">
                  Bulk Orders
                </h3>
                <p className="text-sm sm:text-base text-[#575757] leading-relaxed">
                  Scalable solutions for teams of 10 to 10,000+ recipients
                </p>
              </div>

              {/* Premium Quality */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base sm:text-lg text-[#575757]">
                  Premium Quality
                </h3>
                <p className="text-sm sm:text-base text-[#575757] leading-relaxed">
                  Curated luxury items that reflect your company's standards
                </p>
              </div>

              {/* Logistics Management */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base sm:text-lg text-[#575757]">
                  Logistics Management
                </h3>
                <p className="text-sm sm:text-base text-[#575757] leading-relaxed">
                  Coordinated delivery to multiple locations across Nigeria
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 pt-6 border-t-3 border-[#1E1E1EB2]">
              <div className="space-y-1 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bold text-[#1E1E1EB2]">
                  50+
                </div>
                <div className="text-sm sm:text-lg text-[#1E1E1EB2]">
                  Corporate Clients
                </div>
              </div>
              <div className="space-y-1 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bold text-[#1E1E1EB2]">
                  10,000+
                </div>
                <div className="text-sm sm:text-lg text-[#1E1E1EB2]">
                  Corporate Gifts
                </div>
              </div>
              <div className="space-y-1 min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bold text-[#1E1E1EB2]">
                  98%
                </div>
                <div className="text-sm sm:text-lg text-[#1E1E1EB2]">
                  Satisfaction Rate
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4"></div>
          </div>

          {/* Right Image */}
          <div className="flex flex-col space-y-6 sm:space-y-8 h-full">
            <img
              src={black}
              alt="Corporate gift hamper"
              className="w-full h-64 sm:h-130 md:h-150 object-cover rounded-2xl shadow-md"
            />
            <button className="inline-flex w-fit items-center gap-2 bg-[#414245] text-white px-6 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors duration-200">
              View All Hampers
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gift;
