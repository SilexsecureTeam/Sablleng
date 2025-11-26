// src/components/HeaderSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAllProducts from "../hooks/useAllProducts";

const HeaderSearch = () => {
  const { products, loading } = useAllProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Instant search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const filtered = products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10); // Top 10 matches

    setResults(filtered);
  }, [searchTerm, products]);

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setResults([]);
      inputRef.current?.blur();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:max-w-xl max-w-[80px]">
      <div className="relative">
        <div className="w-full ">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="w-full pl-8 text-white pr-2 py-2 border border-gray-400 rounded-md outline-none"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results - FULL WIDTH max-w-xl */}
      {results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white border shadow-lg rounded-md mt-1 max-h-96 overflow-y-auto"
        >
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={() => {
                setSearchTerm("");
                setResults([]);
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-contain rounded"
              />
              <div>
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">
                  ₦{product.price.toLocaleString()}
                </p>
                {product.customize && (
                  <span className="text-xs text-[#5F1327]">Customizable</span>
                )}
              </div>
            </Link>
          ))}
          {results.length >= 10 && (
            <button
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                setSearchTerm("");
                setResults([]);
              }}
              className="w-full p-4 text-center text-[#5F1327] font-medium hover:bg-gray-50"
            >
              See all results
            </button>
          )}
        </div>
      )}

      {loading && searchTerm && (
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      )}
    </div>
  );
};

export default HeaderSearch;
