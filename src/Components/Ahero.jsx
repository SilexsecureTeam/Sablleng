import React from "react";
import hero from "../assets/ahero.png";

const Ahero = () => {
  return (
    <div
      className="relative bg-cover bg-center min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40"></div> */}

      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="">
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl max-w-[500px] mon mx-auto text-center font-regular text-white mb-4">
            Crafting Moments That
            <span className="text-[#E6A0AC]"> Matter</span>
          </h1>

          {/* Text */}
          <p className="text-white text-center text-sm sm:text-base font-normal max-w-[620px] mx-auto md:text-lg mb-6">
            At Sabllé.ng, we believe that every gift should tell a story. Since
            2020, we've been transforming the art of gifting in Nigeria,
            creating bespoke experiences that celebrate life's most precious
            moments.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:justify-center sm:flex-row gap-8 mb-8">
            <a
              href="/product"
              className="bg-[#5F1327] text-white px-6 py-3 rounded-full font-light text-sm text-center hover:bg-[#b34f5c] transition-colors duration-200"
            >
              Explore Our Collections
            </a>
            <a
              href="/contact"
              className="border border-[#5F1327] text-white px-6 py-3 rounded-full font-light text-sm text-center hover:bg-white hover:text-[#5F1327] transition-colors duration-200"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ahero;
