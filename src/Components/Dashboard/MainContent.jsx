import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

const MainContent = ({ children, toggleSidebar }) => {
  return (
    <div className=" rounded-lg shadow-md  relative">
      {/* Hamburger Menu (Mobile) */}
      <button
        className="md:hidden text-[#5F1327] focus:outline-none absolute top-4 left-4 z-10"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      {/* Content Wrapper */}
      <div className="pt-12 md:pt-0">{children}</div>
    </div>
  );
};

export default MainContent;
