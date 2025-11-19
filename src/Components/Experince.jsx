import React from "react";
import { ArrowRight } from "lucide-react";

const Experince = () => {
  return (
    <div className="py-10 ">
      <div className=" max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 ">
        <div className="">
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-3xl w-full text-center font-light text-[#1E1E1E] mb-4">
            Experience the Sabllé.ng Difference
          </h1>

          {/* Text */}
          <p className="text-[#575757] text-base text-center font-normal max-w-[739px] mx-auto md:text-lg mb-6">
            From the moment you place your order to the smile on your
            recipient's face, every detail is crafted with precision, care, and
            an unwavering commitment to excellence.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 mt-10 justify-center">
            <a
              href="/product"
              className="bg-[#5F1327] text-white flex space-x-4 items-center px-6 py-3 rounded-full font-light text-sm text-center hover:bg-[#b34f5c] transition-colors duration-200"
            >
              Start Your Gift Journey <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="/about"
              className="border border-[#5F1327] text-[#1E1E1E] px-6 py-3 rounded-full font-light text-sm text-center hover:bg-white hover:text-[#5F1327] transition-colors duration-200"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experince;
