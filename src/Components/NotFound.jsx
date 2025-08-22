import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-[#CB5B6A] mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 text-base sm:text-lg mb-6">
          Oops! It seems the page you’re looking for doesn’t exist. Let’s get
          you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-[#CB5B6A] text-white rounded-lg hover:bg-[#b34f5c] transition-colors duration-200"
        >
          Back to Home
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
