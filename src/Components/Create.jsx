import React from "react";
import bgImage from "../assets/create1.png";
import leftImage from "../assets/create.png";
import rightImage from "../assets/create2.png";
import create3 from "../assets/create3.png";
import create4 from "../assets/create4.png";
import { Link } from "react-router-dom";

const Create = () => {
  return (
    <section
      className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "50vh",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Main Content */}
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full min-h-[400px]">
          {/* Left Side: Image */}
          <div className="flex justify-center lg:justify-start">
            <img
              src={leftImage}
              alt="Create Left"
              className="w-full max-w-xs lg:max-w-md h-auto rounded-lg shadow-lg object-cover"
            />
          </div>

          {/* Right Side: Text + Flex Image/Text */}
          <div className="text-white text-center lg:text-left">
            {/* Top Text */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 leading-tight">
              Create your own hamper and the glorious contents — from caviar &
              candles, to jam & jewellery — are entirely up to you.
            </h2>
            <Link
              to="/product"
              // onClick={(e) => e.preventDefault()}
              className="hidden md:inline-block mb-10 bg-[#5F1327] text-white px-4 py-2 rounded-full shadow hover:bg-[#b34f5c] transition-colors duration-200"
            >
              Shop Now
            </Link>

            {/* Flex: Image + Text */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 justify-center lg:justify-start">
              <div className="flex">
                <img
                  src={rightImage}
                  alt="Create Right"
                  className="w-10 object-cover shadow-md flex-shrink-0"
                />
                <img
                  src={create3}
                  alt="Create Right"
                  className="w-10 object-cover shadow-md flex-shrink-0"
                />
                <img
                  src={create4}
                  alt="Create Right"
                  className="w-10 object-cover shadow-md flex-shrink-0"
                />
              </div>

              <div className="text-center lg:text-left">
                <p className="text-xs md:text-sm text-gray-200 mt-1">
                  500+ Happy Clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Create;
