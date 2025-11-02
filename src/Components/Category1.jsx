import React from "react";
import cat1 from "../assets/cat1.png";
import cat2 from "../assets/cat2.png";
import cat3 from "../assets/cat3.png";
import cat4 from "../assets/cat4.png";
import cat5 from "../assets/cat5.png";
import cat6 from "../assets/cat6.png";
import cat7 from "../assets/cat7.png";
import cat8 from "../assets/cat8.png";

const categories = [
  { id: 1, image: cat1, title: "Christmas" },
  { id: 2, image: cat2, title: "Hampers" },
  { id: 3, image: cat3, title: "Corporate" },
  { id: 4, image: cat4, title: "Exclusive at sabblle" },
  { id: 5, image: cat5, title: "For Him" },
  { id: 6, image: cat6, title: "For Her" },
  { id: 7, image: cat7, title: "Birthday" },
  { id: 8, image: cat8, title: "Confectionery" },
];

export default function Category1() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#5F1327] mb-4">
            Explore Our Collections
          </h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group overflow-hidden  duration-300 "
            >
              <div className="h-48 md:h-52 lg:h-56 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm md:text-base font-light text-[#333333] mt-2">
                  {category.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
