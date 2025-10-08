// src/Components/Dashboard/Header.jsx
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center">
      {/* Hamburger Menu (Mobile) */}
      <button
        className="md:hidden text-[#CB5B6A] focus:outline-none"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    </header>
  );
};

export default Header;
