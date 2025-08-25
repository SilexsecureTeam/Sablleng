import React from "react";
import noti from "../assets/icon.png";

const Noti = () => {
  return (
    <div className="bg-[#CB5B6A]  z-50 text-center">
      <div className="py-3 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-2 sm:gap-0">
        <div className="text-white text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-5">
          <div className="flex space-x-5">
            {" "}
            <img src={noti} alt="Notification icon" className="w-6 h-6" />
            <h2>Same-day delivery in Lagos</h2>{" "}
          </div>
          <h2>Free consultation for corporate orders</h2>
        </div>
        <h2 className="text-white text-xs sm:text-sm font-semibold">
          +2348187230200 | <span className="underline">info@sablle.ng</span>
        </h2>
      </div>
    </div>
  );
};

export default Noti;
