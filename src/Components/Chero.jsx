import React from "react";
import hero from "../assets/chero.png";

const Chero = () => {
  return (
    <div
      className="relative bg-cover bg-center min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center w-full justify-center md:justify-start"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40"></div> */}

      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="">
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl max-w-[500px] mon  font-regular text-white mb-4">
            Contact Us
          </h1>

          {/* Text */}
          <p className="text-white text-sm sm:text-base font-normal max-w-[620px] md:text-lg mb-6">
            Get in touch with us today
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chero;
