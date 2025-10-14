import React, { useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";
import products from "../data/products";
import ImageUploadComponent from "./ImageUploadComponent";

const ProductDetail = ({ id }) => {
  const { addItem } = useContext(CartContext);
  const [selectedColor, setSelectedColor] = useState("white");
  const [quantity, setQuantity] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState({
    index: 0,
    bgColor: "bg-gray-50",
    image: null,
  });
  const sliderRef = useRef(null);

  const colors = [
    { name: "black", color: "bg-black" },
    { name: "purple", color: "bg-purple-600" },
    { name: "red", color: "bg-red-500" },
    { name: "yellow", color: "bg-yellow-400" },
  ];

  const product = products.find((p) => p.id === parseInt(id));

  // Define thumbnails after product is initialized
  const thumbnails = product
    ? [
        { bgColor: "bg-blue-100", image: product.image },
        { bgColor: "bg-green-100", image: product.image },
        { bgColor: "bg-red-100", image: product.image },
        { bgColor: "bg-yellow-100", image: product.image },
      ]
    : [];

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Product not found
        </h2>
        <Link
          to="/product"
          className="text-[#CB5B6A] underline mt-4 inline-block"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  // Set initial thumbnail image and background
  if (!selectedThumbnail.image) {
    setSelectedThumbnail({
      index: 0,
      bgColor: thumbnails[0].bgColor,
      image: product.image,
    });
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      model: product.model,
      price: parseFloat(product.price.replace("₦", "")) * 1000,
      image: selectedThumbnail.image,
      quantity: quantity,
    });
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderNow = () => {
    console.log("Order Now clicked for", product.name);
  };

  const handleCustomize = () => {
    setIsCustomizing(true);
  };

  const handleThumbnailClick = (index, thumbnail) => {
    setSelectedThumbnail({
      index,
      bgColor: thumbnail.bgColor,
      image: thumbnail.image,
    });
  };

  return (
    <div className="bg-white py-8 md:py-10">
      {/* Product or Customization Section */}
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white p-8">
          {isCustomizing ? (
            <ImageUploadComponent
              productId={id}
              onBack={() => setIsCustomizing(false)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div
                  className={`rounded-lg p-8 flex items-center justify-center ${selectedThumbnail.bgColor}`}
                >
                  <img
                    src={selectedThumbnail.image || product.image}
                    alt={product.name}
                    className="max-h-64 md:h-80 max-w-full object-contain"
                  />
                </div>
                <div className="flex space-x-4">
                  {thumbnails.map((thumbnail, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 ${
                        thumbnail.bgColor
                      } rounded border flex items-center justify-center cursor-pointer ${
                        selectedThumbnail.index === index
                          ? "border-gray-800 border-2"
                          : "border-gray-300"
                      }`}
                      onClick={() => handleThumbnailClick(index, thumbnail)}
                    >
                      <img
                        src={thumbnail.image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {product.name}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {product.badge
                    ? `Customizable product: ${
                        product.name
                      }. Perfect for ${product.category.toLowerCase()}. Model: ${
                        product.model
                      }.`
                    : `Explore the ${product.name}, a premium product in the ${product.category} category. Model: ${product.model}.`}
                </p>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-gray-500 w-24">Color:</span>
                    <span className="text-gray-900">{selectedColor}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Brand:</span>
                    <span className="text-gray-900">ACMELL</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Material:</span>
                    <span className="text-gray-900">Premium</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Category:</span>
                    <span className="text-gray-900">{product.category}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Price:</span>
                    <span className="text-gray-900">{product.price}</span>
                  </div>
                </div>
                <div className="space-x-3 flex items-center">
                  <label className="text-gray-900 font-medium">
                    Select color:
                  </label>
                  <div className="flex space-x-3">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          color.color
                        } ${
                          selectedColor === color.name
                            ? "border-gray-800"
                            : "border-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-x-3 flex items-center">
                  <label className="text-gray-900 font-medium">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18 12H6"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-x-3 space-y-3">
                  <button
                    className="bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-white font-medium py-3 px-8 rounded transition-colors"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                  {product.badge === "Customizable" ? (
                    <button
                      className="bg-[#CB5B6A] hidden hover:bg-[#CB5B6A]/70 text-white font-medium py-3 px-8 rounded transition-colors"
                      onClick={handleCustomize}
                    >
                      Customize
                    </button>
                  ) : (
                    <button
                      className="bg-[#CB5B6A] hidden hover:bg-[#CB5B6A]/70 text-white font-medium py-3 px-8 rounded transition-colors"
                      onClick={handleOrderNow}
                    >
                      Order Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Reviews</h2>
          <div className="grid gap-10">
            <div className="flex flex-col md:flex-row md:space-x-10 md:space-y-0 space-y-6">
              <div className="text-center bg-gray-100 p-4">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {product.reviews?.averageRating || "N/A"}
                </div>
                <div className="text-gray-500 mb-3">
                  of {product.reviews?.totalReviews || 0} reviews
                </div>
                <div className="flex justify-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.reviews?.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 fill-current"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {(product.reviews?.ratings || []).map((rating) => (
                  <div
                    key={rating.label}
                    className="flex items-center space-x-4"
                  >
                    <span className="text-gray-700 w-24 text-sm">
                      {rating.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${rating.color} h-2 rounded-full`}
                        style={{ width: `${rating.value}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-500 text-sm w-8 text-right">
                      {rating.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 text-center">
              <button className="text-gray-400 text-sm underline">
                Leave Comment
              </button>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <div className="space-y-6">
                {(product.reviews?.comments || []).map((comment) => (
                  <div
                    key={comment.author + comment.date}
                    className="flex bg-[#FAFAFA] p-4 items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {comment.author}
                        </h4>
                        <span className="text-gray-400 text-sm">
                          {comment.date}
                        </span>
                      </div>
                      <div className="flex space-x-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= comment.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 fill-current"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Slider */}
      {relatedProducts.length > 0 ? (
        <div className="max-w-[1200px] mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Related Products
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={scrollLeft}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Scroll left"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={scrollRight}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Scroll right"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6 pb-4"
            >
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="flex-none w-64 snap-start"
                >
                  <Link
                    to={`/product/${relatedProduct.id}`}
                    className="bg-white overflow-hidden block hover:shadow-lg transition-shadow duration-200"
                    aria-label={`View details for ${relatedProduct.name}`}
                  >
                    <div className="relative bg-[#F4F2F2] p-4 h-48 flex items-center justify-center">
                      {relatedProduct.badge && (
                        <div className="absolute top-6 left-0 bg-[#CB5B6A] text-white px-8 py-2 rounded text-sm font-medium">
                          {relatedProduct.badge}
                        </div>
                      )}
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="py-4">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {relatedProduct.name}
                      </h3>
                      <span className="text-lg font-semibold text-gray-900">
                        {relatedProduct.price}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-[#CB5B6A] py-1 rounded">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto p-8 text-center">
          <p className="text-gray-600">No related products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
