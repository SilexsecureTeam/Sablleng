import React from "react";
import hero from "../assets/phero.png";

const Phero = () => {
  return (
    <div
      className="relative bg-cover bg-center min-h-[50vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40"></div> */}

      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl max-w-[540px] leading-14 mon mx-auto text-center font-regular text-white mb-4">
            From Loved Ones to Clients, Perfectly Crafted Gifts for All
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Phero;
