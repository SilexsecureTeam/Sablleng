import React from "react";
import {
  Truck,
  Award,
  Handshake,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

const Value = () => {
  // Data array for mapping
  const featuresData = [
    {
      icon: <Award className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />,
      title: "Passion for Excellence",
      text: "We pour our hearts into every gift, ensuring each one tells a unique story and creates lasting memories.",
      bgColor: "bg-[#5F1327]",
      hoverColor: "hover:bg-[#322D2F]",
    },
    {
      icon: (
        <ShieldCheck className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />
      ),
      title: "Uncompromising Quality",
      text: "From sourcing to delivery, we maintain the highest standards to exceed expectations every time.",
      bgColor: "bg-[#322D2F]",
      hoverColor: "hover:bg-[#5F1327]",
    },
    {
      icon: (
        <Handshake className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />
      ),
      title: "Personal Touch",
      text: "Every client receives personalized attention from our dedicated concierge team.",
      bgColor: "bg-[#322D2F]",
      hoverColor: "hover:bg-[#5F1327]",
    },
    {
      icon: <Truck className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />,
      title: "Reliable Service",
      text: "Same-day delivery across Lagos with real-time tracking and signature confirmation.",
      bgColor: "bg-[#322D2F]",
      hoverColor: "hover:bg-[#5F1327]",
    },
    {
      icon: (
        <HeartHandshake className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />
      ),
      title: "Trust & Integrity",
      text: "Building lasting relationships through transparency, reliability, and exceptional service.",
      bgColor: "bg-[#322D2F]",
      hoverColor: "hover:bg-[#5F1327]",
    },
    {
      icon: (
        <Lightbulb className="w-10 h-10 text-white bg-[#BF9797] p-2 mb-4" />
      ),
      title: "Innovation",
      text: "From sourcing to delivery, we maintain the highest standards to exceed expectations every time.",
      bgColor: "bg-[#322D2F]",
      hoverColor: "hover:bg-[#5F1327]",
    },
  ];

  return (
    <div className="bg-[#FFF2F2]">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-4xl text-center text-[#C67A84] mb-2">
          Our Values
        </h2>
        <p className="text-base text-center mx-auto max-w-[500px] text-[#414245]">
          These core principles guide everything we do, from product curation to
          customer service
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-8 md:gap-12 gap-6">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-start text-start p-6 md:p-10 ${feature.bgColor} ${feature.hoverColor} cursor-pointer hover:scale-105 duration-200`}
            >
              {" "}
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white font-light">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Value;
