import React from "react";
import { ArrowRight } from "lucide-react";
import bag from "../assets/bag.png";
import gift from "../assets/gift.png";
import home from "../assets/home.png";

const SabileLanding = () => {
  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Simply Unique/
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simply Better.
            </h2>
          </div>
          <div className="text-center md:text-right">
            <p className="text-base sm:text-lg text-gray-700 md:mr-8 max-w-[480px]">
              <b>Sabile</b> is a gift & decorations store based in HCMC,
              Vietnam. Est since 2019.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bags & Travel */}
          <div className="lg:col-span-2 relative group cursor-pointer">
            <div
              className="bg-cover object-fill  bg-top  h-80 md:h-96 lg:h-[600px] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
              style={{ backgroundImage: `url(${bag})` }}
            >
              <div className="absolute top-6 left-6 z-10  p-4">
                <h3 className="text-3xl font-semibold text-black mb-2">
                  Bags & Travel
                </h3>
                <a
                  href="/bags-travel"
                  className="flex items-center text-black underline font-semibold transition-colors duration-200"
                >
                  Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Corporate Gifts & Home/Outdoor */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            {/* Corporate Gifts */}
            <div className="relative group cursor-pointer">
              <div
                className="bg-cover bg-center  h-80 md:h-96 lg:h-[290px] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
                style={{ backgroundImage: `url(${gift})` }}
              >
                <div className="absolute bottom-6 left-6 z-10  rounded-lg p-4">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Corporate Gifts
                  </h3>
                  <a
                    href="/corporate-gifts"
                    className="flex items-center text-black font-semibold text-sm underline transition-colors duration-200"
                  >
                    Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* Home & Outdoor */}
            <div className="relative group cursor-pointer">
              <div
                className="bg-cover bg-center  h-80 md:h-96 lg:h-[290px] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
                style={{ backgroundImage: `url(${home})` }}
              >
                <div className="absolute bottom-6 left-6 z-10  rounded-lg p-4">
                  <h3 className="text-3xl font-semibold text-black mb-2">
                    Home & <br />
                    Outdoor
                  </h3>
                  <a
                    href="/home-outdoor"
                    className="flex items-center text-black font-semibold underline text-sm transition-colors duration-200"
                  >
                    Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SabileLanding;
