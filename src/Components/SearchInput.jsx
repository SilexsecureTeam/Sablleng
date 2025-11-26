// src/components/SearchInput.jsx
import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  // Keep focus even if parent tries to steal it
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]); // Yes, even on value change

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        Search Products
      </label>
      <div className="mt-2 relative">
        <Search
          size={18}
          className="absolute left-3 top-3.5 text-gray-400 pointer-events-none z-10"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mug, card, birthday, gift..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5F1327] focus:border-[#5F1327] outline-none transition-all"
          autoComplete="off"
          // These are critical
          onKeyDown={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()} // Prevent click from blurring
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
