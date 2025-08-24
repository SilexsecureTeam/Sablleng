import React from "react";
import { Truck, Lock, CreditCard, Phone } from "lucide-react";

const Features = () => {
  // Data array for mapping
  const featuresData = [
    {
      icon: <Truck className="w-10 h-10 text-white mb-4" />,
      title: "Free Shipping",
      text: "Order above $200",
      bgColor: "bg-[#CB5B6A]",
    },
    {
      icon: <CreditCard className="w-10 h-10 text-white mb-4" />,
      title: "Money-back",
      text: "30 days guarantee",
      bgColor: "bg-black",
    },
    {
      icon: <Lock className="w-10 h-10 text-white mb-4" />,
      title: "Secure Payments",
      text: "Secured by Stripe",
      bgColor: "bg-black",
    },
    {
      icon: <Phone className="w-10 h-10 text-white mb-4" />,
      title: "24/7 Support",
      text: "Phone and Email support",
      bgColor: "bg-black",
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-start text-start p-6 ${feature.bgColor} cursor-pointer hover:scale-105 duration-200 `}
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white font-light">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
