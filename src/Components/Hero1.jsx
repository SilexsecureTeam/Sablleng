import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.png";
import hero4 from "../assets/hero4.jpg";
import hero5 from "../assets/hero5.jpg";
import hero6 from "../assets/hero6.jpg";

const images = [hero1, hero2, hero3, hero4, hero5, hero6];

export default function Hero1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const totalSlides = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === totalSlides - 1) {
          setDirection(-1);
          return prev - 1;
        } else if (prev === 0) {
          setDirection(1);
          return prev + 1;
        } else {
          return prev + direction;
        }
      });
    }, 3000); // slide interval time in ms

    return () => clearInterval(interval);
  }, [direction, totalSlides]);

  const getOverlayContent = (index) => {
    switch (index) {
      case 0: // First image: Text overlay
        return (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <h2 className="text-3xl md:text-6xl text-center font-bold mb-4 drop-shadow-lg flex flex-col items-center gap-4">
              <span className="leading-tight">
                {" "}
                {/* Tightens line height for the text stack */}
                Up to 50% <br />
                Off on
              </span>
              <span className="bg-[#5F1327] text-white px-8 py-2 text-2xl md:text-4xl rounded-full inline-block">
                {" "}
                {/* inline-block + py for vertical padding */}
                Confectionaries
              </span>
            </h2>
          </div>
        );
      case 1: // Second image: Button to For Him
        return (
          <Link
            to="/groups/for-him"
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#5F1327] text-white px-4 py-4 md:px-8 rounded-full font-semibold text-base md:text-xl shadow-lg hover:bg-[#8B1A3A] hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out drop-shadow-lg"
          >
            Shop For Him
          </Link>
        );
      case 2: // Third image: No overlay (or add if needed)
        return null;
      case 3: // Fourth image: Button to For Her
        return (
          <Link
            to="/groups/for-her"
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#5F1327] text-white px-4 py-4 md:px-8 rounded-full font-semibold text-base md:text-xl shadow-lg hover:bg-[#8B1A3A] hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out drop-shadow-lg"
          >
            Shop For Her
          </Link>
        );
      case 4: // Fifth image: Button to Hampers
        return (
          <Link
            to="/groups/hampers"
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#5F1327] text-white px-4 py-4 md:px-8 rounded-full font-semibold text-base md:text-xl shadow-lg hover:bg-[#8B1A3A] hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out drop-shadow-lg"
          >
            Explore Hampers
          </Link>
        );
      case 5: // Sixth image: Button to Exclusive at sabblle
        return (
          <Link
            to="/groups/exclusive-at-sabblle"
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#5F1327] text-white  px-4 py-4 md:px-8 rounded-full font-semibold text-base md:text-xl shadow-lg hover:bg-[#8B1A3A] hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out drop-shadow-lg"
          >
            Exclusive Deals
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Responsive height: 40vh on mobile, scaling up to 70vh on large screens */}
      <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh]">
        <div
          className="flex h-full w-[600%] transition-transform duration-1000 ease-in-out" // Updated for 6 images
          style={{
            transform: `translateX(-${currentIndex * (100 / totalSlides)}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="w-full h-full relative flex items-center justify-center" // Added relative for overlays
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {getOverlayContent(i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
