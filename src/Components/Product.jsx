import React from "react";
import { Link } from "react-router-dom";
import  products  from "../data/products";

const Product = () => {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative bg-[#F4F2F2] p-4 h-48 md:h-80 flex items-center justify-center">
                {product.badge && (
                  <div className="absolute top-6 left-0 bg-[#F35B5A] text-white px-8 py-2 rounded text-sm font-medium">
                    {product.badge}
                  </div>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="py-4">
                <h3 className="font-medium text-gray-900 text-sm">
                  {product.name}
                </h3>
                <span className="text-lg font-semibold text-gray-900">
                  {product.price}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base text-[#CB5B6A] py-1 rounded">
                    {product.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;