import React from "react";
import { HandHeart, Leaf, Truck, Headphones } from "lucide-react";

const brandText = "text-[#5F1327]";
const brandIconBg = "bg-[#C67A84]";

const Choose = () => {
  const leftCol = [
    {
      icon: HandHeart,
      title: "Curated by Hand",
      text: "Every gift is personally selected and arranged by our luxury curation experts.",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Packaging",
      text: "Sustainable, elegant packaging that reflects our commitment to the environment.",
    },
  ];

  const rightCol = [
    {
      icon: Truck,
      title: "Same-Day Delivery",
      text: "Premium concierge delivery across Lagos with real-time tracking.",
    },
    {
      icon: Headphones,
      title: "Concierge Experience",
      text: "White-glove service from consultation to delivery, tailored to your needs.",
    },
  ];
  /* eslint-disable no-unused-vars */
  const Feature = ({ Icon, title, text }) => (
    <article
      className="flex items-start gap-3 py-6 group focus-within:ring-2 focus-within:ring-[#5F1327]/40 rounded-lg outline-none"
      tabIndex={-1}
      aria-label={title}
    >
      <span
        className={`shrink-0 ${brandIconBg} rounded-md p-2.5 ring-1 ring-black/5 shadow-sm transition-transform group-hover:-translate-y-0.5`}
      >
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </article>
  );

  return (
    <section className="bg-white py-8 sm:py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-16">
          {/* Left text block */}
          <div className="lg:col-span-4">
            <h2 className={`text-2xl sm:text-3xl font-semibold ${brandText}`}>
              Why Choose Sablle.ng
            </h2>
            <p className="mt-4 text-base leading-6 text-slate-600 max-w-md">
              We don’t just deliver gifts – we create experiences that leave
              lasting impressions and strengthen the bonds that matter most.
            </p>
          </div>

          {/* Right features with center divider and inner rules */}
          <div className="lg:col-span-8 md:mt-20">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {/* Vertical divider between the two columns (desktop only) */}
              <div
                className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black"
                aria-hidden="true"
              />

              {/* Left feature column with a subtle horizontal rule between items */}
              <div className="divide-y divide-black lg:mt-12">
                {leftCol.map((item, i) => (
                  <div key={i}>
                    <Feature
                      Icon={item.icon}
                      title={item.title}
                      text={item.text}
                    />
                  </div>
                ))}
              </div>

              {/* Right feature column, align content and include divider between its items */}
              <div className="md:pl-12 divide-y divide-black">
                {rightCol.map((item, i) => (
                  <div key={i}>
                    <Feature
                      Icon={item.icon}
                      title={item.title}
                      text={item.text}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Choose;
