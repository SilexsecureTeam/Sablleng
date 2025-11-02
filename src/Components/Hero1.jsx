import React, { useState, useEffect } from "react";
import hero1 from "../assets/hero1.png";
import hero2 from "../assets/hero2.png";
import hero3 from "../assets/hero3.png";
import hero4 from "../assets/hero4.png";

const images = [hero1, hero2, hero3, hero4];

export default function Hero1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === images.length - 1) {
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
  }, [direction]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Responsive height: 40vh on mobile, scaling up to 70vh on large screens */}
      <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh]">
        <div
          className="flex h-full w-[400%] transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 25}%)` }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="w-full h-full flex items-center justify-center" // Center content
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover", // FIXED: Clearer, fills without distortion
                backgroundPosition: "center", // Ensures sharp centering
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
