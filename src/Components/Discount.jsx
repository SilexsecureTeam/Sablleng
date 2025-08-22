import React from "react";
import { Gift, Star, Mail, ArrowRight } from "lucide-react";

const Discount = () => {
  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="bg-[#6B3838] rounded-2xl py-12 px-6 text-center text-white max-w-[1200px] mx-auto">
        {/* Title */}
        <h2 className="text-2xl text-[#F0E1E1] font-light mb-3">
          Get 10% Off Your First Gift
        </h2>

        {/* Subtitle */}
        <p className="text-base font-light mb-8 max-w-lg mx-auto">
          Join our exclusive gift list for VIP access to new collections,
          seasonal specials, and insider gifting tips.
        </p>

        {/* Features */}
        <div className="flex justify-center gap-8 mb-10 flex-wrap">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-white/50" />
            <span className="text-sm">Exclusive Collections</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-white/50" />
            <span className="text-sm">VIP-Only Offers</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-white/50" />
            <span className="text-sm">Gifting Tips &amp; Guides</span>
          </div>
        </div>

        {/* Input + Button */}
        <form className="flex justify-center items-center gap-3 flex-wrap">
          <input
            type="email"
            placeholder="Enter Email address"
            className="px-5 py-3 rounded-full bg-white text-gray-700 w-64 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#CB5B6A] hover:bg-[#a84a4a] text-white px-6 py-3 rounded-full text-sm transition"
          >
            Join our gift list
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Discount;
