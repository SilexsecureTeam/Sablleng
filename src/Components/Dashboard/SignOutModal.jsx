import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const SignOutModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 transform transition-transform duration-300 scale-100 sm:scale-105"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-yellow-500 w-12 h-12" />
        </div>
        <h2 className="text-lg font-semibold text-center text-gray-800">
          Confirm Log Out
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Are you sure you want to log out?
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
