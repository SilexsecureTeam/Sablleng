import React from "react";
import { ArrowRight } from "lucide-react";
import promo from "../assets/hower.png";

const PromoSection = () => {
  return (
    <section className="">
      <div
        className="
      "
      >
        <div className="flex flex-col md:flex-row items-center">
          {/* Image - Left */}
          <div className="w-full md:w-1/2">
            <img
              src={promo}
              alt="Promotional item"
              className="w-full h-fit sm:h-96 md:h-100 object-top "
            />
          </div>

          {/* Content - Right */}
          <div className="w-full md:w-1/2 px-4 md:px-20 text-white flex flex-col items-center text-left  h-fit sm:h-96 md:h-100  justify-center  bg-[#5F1327]">
            <div className="mx-auto w-fit md:w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium  mb-4">
                HUNDREDS of <br />
                New lower prices!
              </h2>
              <p className="text-sm sm:text-base font-light max-w-[350px]  mb-6">
                It’s more affordable than ever to give every room in your home a
                stylish makeover
              </p>
              <a
                href="/shop"
                className="flex items-center  font-light text-base underline decoration-2 underline-offset-4 transition-colors duration-200"
              >
                Shop Now <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
