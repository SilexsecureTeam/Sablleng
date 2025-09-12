import React from "react";
import trust1 from "../assets/trust1.png";
import trust2 from "../assets/trust2.png";
import trust3 from "../assets/trust3.png";
import trust4 from "../assets/trust4.png";
import trust5 from "../assets/trust5.png";

const Trust = () => {
  const partners = [
    { src: trust1, alt: "Trusted Partner 1" },
    { src: trust2, alt: "Trusted Partner 2" },
    { src: trust3, alt: "Trusted Partner 3" },
    { src: trust4, alt: "Trusted Partner 4" },
    { src: trust5, alt: "Trusted Partner 5" },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-light text-black text-center mb-4">
          Trusted by Leading Organizations
        </h2>
        <div className="overflow-x-hidden">
          <div className="flex gap-6 md:gap-8 py-4 animate-scroll">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex-none w-32 sm:w-40 md:w-48 h-20 md:h-24 flex items-center justify-center"
              >
                <img
                  src={partner.src}
                  alt={partner.alt}
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}
            {partners.map((partner, index) => (
              <div
                key={`duplicate-${index}`}
                className="flex-none w-32 sm:w-40 md:w-48 h-20 md:h-24 flex items-center justify-center"
              >
                <img
                  src={partner.src}
                  alt={partner.alt}
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
