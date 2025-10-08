// src/Components/Dashboard/MainContent.jsx
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

const MainContent = ({ children, toggleSidebar }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {/* Hamburger Menu (Mobile) */}
      <button
        className="md:hidden text-[#CB5B6A] focus:outline-none absolute top-4 left-4"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      {children}
    </div>
  );
};

export default MainContent;
