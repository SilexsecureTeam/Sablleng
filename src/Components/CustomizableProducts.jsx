// src/Components/CustomizableProducts.js
import React from "react";
import { Link } from "react-router-dom";
import products from "../data/products";

const CustomizableProducts = () => {
  const customizableProducts = products.filter(
    (p) => p.badge === "Customizable"
  );

  return (
    <div className="bg-white py-8 md:py-10">
      <div className="max-w-[1200px] mx-auto p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Select a Product to Customize
        </h2>
        {customizableProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customizableProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200 animate-fade-in"
              >
                <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                  {product.badge && (
                    <div className="absolute top-6 left-0 bg-[#CB5B6A] text-white px-8 py-2 rounded text-sm font-medium">
                      {product.badge}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {product.name}
                  </h3>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#CB5B6A] py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            No customizable products available.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomizableProducts;
