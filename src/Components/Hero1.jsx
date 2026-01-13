import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

export default function Hero1() {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("https://api.sablle.ng/api/hero-slides", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        let list = Array.isArray(data.data) ? data.data : [];

        // Sort by order
        list.sort(
          (a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999)
        );

        setSlides(list);
      } catch (err) {
        console.error(err);
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (isLoading) {
    return <div className="h-[40vh] sm:h-[60vh] bg-gray-100 animate-pulse" />;
  }

  if (slides.length === 0) {
    return (
      <div className="h-[40vh] bg-gray-200 flex items-center justify-center text-gray-500">
        No hero slides available
      </div>
    );
  }

  const getOverlay = (slide) => {
    // Your existing logic - can stay exactly the same
    if (
      slide.title?.toLowerCase().includes("confectionaries") ||
      slide.title?.includes("50%")
    ) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
          <h2 className="text-3xl md:text-6xl text-center font-bold mb-4 drop-shadow-lg flex flex-col items-center gap-4">
            <span className="leading-tight">
              Up to 50% <br /> Off on
            </span>
            <span className="bg-[#5F1327] text-white px-8 py-2 text-2xl md:text-4xl rounded-full inline-block">
              Confectionaries
            </span>
          </h2>
        </div>
      );
    }

    if (slide.link_url) {
      return (
        <Link
          to={
            slide.link_url.startsWith("http")
              ? new URL(slide.link_url).pathname
              : slide.link_url
          }
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5F1327] text-white px-4 py-4 md:px-8 rounded-full font-semibold text-base md:text-xl shadow-lg hover:bg-[#8B1A3A] hover:scale-105 transition-all duration-300"
        >
          {slide.title || "Shop Now"}
        </Link>
      );
    }

    // fallback
    return slide.title ? (
      <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
        <h2 className="text-4xl md:text-6xl font-bold text-center drop-shadow-2xl px-6">
          {slide.title}
        </h2>
      </div>
    ) : null;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1}
        autoplay={{
          delay: 9000,
          disableOnInteraction: false,
        }}
        speed={1000}
        className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${slide.image_url})`,
              }}
            >
              {getOverlay(slide)}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
