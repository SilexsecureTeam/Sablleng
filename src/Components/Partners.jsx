import React from "react";
import pat1 from "../assets/pat1.png";
import pat2 from "../assets/pat2.png";
import pat3 from "../assets/pat3.png";
import pat4 from "../assets/pat4.png";
import pat5 from "../assets/pat5.png";

const partners = [pat1, pat2, pat3, pat4, pat5];

export default function Partners() {
  return (
    <section className="py-8 md:py-12  overflow-hidden">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap w-full">
          {[...partners, ...partners].map((image, index) => (
            <div
              key={index}
              className="inline-flex items-center justify-center mx-4 sm:mx-6 flex-shrink-0"
            >
              <img
                src={image}
                alt={`Partner ${index + 1}`}
                className="h-8 md:h-10 lg:h-14 w-auto max-h-10 sm:max-h-12 lg:max-h-16 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 10s linear infinite;
        }
        /* Pause on hover for better UX */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
