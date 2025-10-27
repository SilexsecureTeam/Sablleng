import React from "react";
import { useParams } from "react-router-dom";
import hero from "../assets/phero.png";

const Cahero = () => {
  const { categorySlug } = useParams();

  const formattedCategoryName = categorySlug
    ? categorySlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Category";

  return (
    <div
      className="relative bg-cover bg-center min-h-[50vh] md:min-h-[45vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl max-w-[540px] leading-14 mon mx-auto text-center font-regular text-white mb-4">
            {formattedCategoryName}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Cahero;
