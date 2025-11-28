// src/components/HeaderSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAllProducts from "../hooks/useAllProducts";

const HeaderSearch = ({ autoFocus = false, onClose }) => {
  const { products, loading } = useAllProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const filtered = products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10);

    setResults(filtered);
  }, [searchTerm, products]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setResults([]);
      onClose?.();
    }
    if (e.key === "Escape") {
      onClose?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (!searchTerm) onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search
          size={20}
          className="absolute left-3 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30 rounded-full outline-none focus:border-white transition-all duration-200"
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={() => {
                setSearchTerm("");
                onClose?.();
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600">
                  ₦{product.price.toLocaleString()}
                </p>
                {product.customize && (
                  <span className="text-xs text-[#5F1327] font-medium">
                    Customizable
                  </span>
                )}
              </div>
            </Link>
          ))}
          {results.length >= 10 && (
            <button
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                setSearchTerm("");
                onClose?.();
              }}
              className="w-full p-4 text-center text-[#5F1327] font-semibold hover:bg-gray-50 border-t"
            >
              See all results →
            </button>
          )}
        </div>
      )}

      {loading && searchTerm && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}
    </div>
  );
};

export default HeaderSearch;
