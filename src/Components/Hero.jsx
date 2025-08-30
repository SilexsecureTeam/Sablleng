import React, { useState, useEffect } from "react";
import hero from "../assets/hero.png";
import hero1 from "../assets/ahero.png";
import hero2 from "../assets/phero.png";
import avatar1 from "../assets/avatar1.png";
import avatar2 from "../assets/avatar2.png";
import avatar3 from "../assets/avatar3.png";

const Hero = () => {
  const images = [hero, hero1, hero2];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-start overflow-hidden">
      {/* Image Slider */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40"></div> */}

      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div>
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl mon md:text-5xl max-w-[500px] font-regular text-white mb-4">
            Luxury Gifts That
            <span className="text-[#E6A0AC]"> Speak</span> from the Heart
          </h1>

          {/* Text */}
          <p className="text-white text-sm sm:text-base font-normal max-w-[500px] md:text-lg mb-6">
            Explore our exclusive collection with same-day delivery in Lagos and
            free consultation for corporate orders.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            <a
              href="/product"
              className="bg-[#CB5B6A] text-white px-6 py-3 rounded-full font-light text-sm text-center hover:bg-[#b34f5c] transition-colors duration-200"
            >
              Customize a Gift
            </a>
            <a
              href="/"
              className="border border-[#CB5B6A] text-white px-6 py-3 rounded-full font-light text-sm text-center hover:bg-white hover:text-[#CB5B6A] transition-colors duration-200"
            >
              Browse Collections
            </a>
          </div>

          {/* Avatars */}
          <div className="flex items-center gap-6">
            <div className="flex items-center -space-x-3">
              <img
                src={avatar1}
                alt="Customer 1"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src={avatar2}
                alt="Customer 2"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src={avatar3}
                alt="Customer 3"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white transform hover:scale-110 transition-transform duration-200"
              />
            </div>
            <span className="text-white text-base">500+ Happy Clients</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
