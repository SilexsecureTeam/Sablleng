import React from "react";

const NumberComponent = () => {
  // Data array for mapping
  const numbersData = [
    {
      value: "500+",
      label: "Satisfied Clients",
      description: "Across Nigeria",
    },
    {
      value: "2,500+",
      label: "Gifts Delivered",
      description: "With love & care",
    },
    {
      value: "24hr",
      label: "Delivery Time",
      description: "Same-day available",
    },
    {
      value: "4.9★",
      label: "Customer Rating",
      description: "Consistently excellent ",
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto bg-[#BF9797] py-6 sm:py-8 md:py-10 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 sm:gap-6 md:gap-10 justify-center">
          {numbersData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 sm:p-6 hover:bg-[#A66F6F]/50 rounded-lg transition-colors duration-200"
              aria-label={`${item.label} - ${item.value}`}
            >
              {/* Value with Star for ratings */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                {item.value}
              </div>
              {/* Label */}
              <h3 className="text-sm sm:text-base md:text-lg text-white mb-2">
                {item.label}
              </h3>
              {/* Description */}
              <p className="text-xs sm:text-sm text-white leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NumberComponent;
