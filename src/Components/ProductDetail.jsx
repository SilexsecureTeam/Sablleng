import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
import "react-toastify/dist/ReactToastify.css";
import ImageUploadComponent from "./ImageUploadComponent";
import RelatedProducts from "../Components/RelatedProducts";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  // const [product, setProduct] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState({
    index: 0,
    bgColor: "bg-gray-50",
    image: null,
  });

  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-red-100",
    "bg-yellow-100",
  ];

  const {
    data: product,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const productId = parseInt(id);

      const [productResponse] = await Promise.all([
        fetch(`https://api.sablle.ng/api/products/${productId}`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store",
          },
        }),
        fetch(`https://api.sablle.ng/api/products?per_page=100`),
      ]);

      if (!productResponse.ok) {
        const err = await productResponse.json().catch(() => ({}));
        throw new Error(err.message || "Product not found");
      }

      const data = await productResponse.json();

      const formattedProduct = {
        id: data.id,
        name: data.name || "",
        rawPrice: data.sale_price_inc_tax
          ? parseFloat(data.sale_price_inc_tax)
          : 0,
        price: data.sale_price_inc_tax
          ? `₦${parseFloat(data.sale_price_inc_tax).toLocaleString()}`
          : "Price Unavailable",
        category: data.category?.name || "Uncategorized",
        categoryId: data.category?.id,
        badge: data.customize ? "Customizable" : null,
        images:
          data.images?.map(
            (img) => img.url || `https://api.sablle.ng/storage/${img.path}`
          ) || [],
        image:
          data.images?.[0]?.url ||
          (data.images?.[0]?.path
            ? `https://api.sablle.ng/storage/${data.images[0].path}`
            : null),
        model: data.product_code || "N/A",
        customize: data.customize,
        sizes: data.size || null,
        brand: data.brand?.name || "",
        supplier: data.supplier?.name || "",
        colours: data.colours || [],
        description: data.description || "",
      };

      // Set initial selections
      if (formattedProduct.sizes?.length > 0) {
        setSelectedSize(formattedProduct.sizes[0]);
      }
      if (formattedProduct.colours?.length > 0) {
        setSelectedColor(formattedProduct.colours[0].value);
      }

      return formattedProduct;
    },
    enabled: !!id,
  });

  const thumbnails = product?.images
    ? product.images.map((img, index) => ({
        bgColor: bgColors[index % bgColors.length],
        image: img,
      }))
    : [];

  useEffect(() => {
    if (product?.image) {
      const img = new Image();
      img.src = product.image;
    }
    if (product?.images?.length > 0) {
      product.images.slice(0, 4).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [product]);

  const handleThumbnailClick = (index, thumbnail) => {
    setSelectedThumbnail({
      index,
      bgColor: thumbnail.bgColor,
      image: thumbnail.image,
    });
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleCustomize = () => {
    setIsCustomizing(true);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const price = product.rawPrice;

      if (!price || price <= 0) return;

      await addItem({
        id: product.id,
        name: product.name,
        model: product.model,
        price: price,
        image: selectedThumbnail.image,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        customized: false,
      });

      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const price = product.rawPrice;

      if (!price || price <= 0) return;

      await addItem({
        id: product.id,
        name: product.name,
        model: product.model,
        price: price,
        image: selectedThumbnail.image || product.image,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        customized: false,
      });

      setTimeout(() => {
        navigate("/delivery");
      }, 800);
    } catch (error) {
      console.error("Buy Now failed:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-6">
            <div className="bg-gray-200 rounded-lg h-96" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
            <div className="space-y-4 pt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-gray-100 rounded w-48" />
              ))}
            </div>
            <div className="flex gap-4 pt-8">
              <div className="h-12 bg-gray-200 rounded-lg w-32" />
              <div className="h-12 bg-gray-200 rounded-lg flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {error?.message || "Product not found"}
        </h2>
        <Link
          to="/product"
          className="text-[#5F1327] underline mt-4 inline-block"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 md:py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white p-8">
          {isCustomizing ? (
            <ImageUploadComponent
              product={product}
              auth={auth}
              onBack={() => setIsCustomizing(false)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div
                  className={`rounded-lg p-8 flex items-center justify-center ${selectedThumbnail.bgColor}`}
                >
                  {product.images?.length > 0 || product.image ? (
                    <img
                      src={
                        selectedThumbnail.image ||
                        product.images?.[0] ||
                        product.image
                      }
                      alt={product.name}
                      className="max-h-64 md:h-80 max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-24 h-40 md:h-60 text-gray-400" />
                    </div>
                  )}
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
              <div className="space-y-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {product.name
                    ? product.name.charAt(0).toUpperCase() +
                      product.name.slice(1).toLowerCase()
                    : "Loading..."}
                </h1>
                <p className="text-gray-800 text-lg leading-relaxed">
                  {product.description
                    ? product.description.charAt(0).toUpperCase() +
                      product.description.slice(1)
                    : "No description available."}
                </p>

                <div className="space-y-3">
                  {/* Selected Color – only show if user picked one */}
                  {selectedColor && (
                    <div className="flex">
                      <span className="text-gray-500 w-24">Color:</span>
                      <span className="text-gray-900">
                        {selectedColor.charAt(0).toUpperCase() +
                          selectedColor.slice(1).toLowerCase()}
                      </span>
                    </div>
                  )}

                  {/* Brand – only if product.brand exists and isn't empty */}
                  {product.brand &&
                    typeof product.brand === "string" &&
                    product.brand.trim() && (
                      <div className="flex">
                        <span className="text-gray-500 w-24">Brand:</span>
                        <span className="text-gray-900">
                          {product.brand.charAt(0).toUpperCase() +
                            product.brand.slice(1).toLowerCase()}
                        </span>
                      </div>
                    )}

                  {/* Supplier – same check */}
                  {product.supplier &&
                    typeof product.supplier === "string" &&
                    product.supplier.trim() && (
                      <div className="flex">
                        <span className="text-gray-500 w-24">Suppliers:</span>
                        <span className="text-gray-900">
                          {product.supplier.charAt(0).toUpperCase() +
                            product.supplier.slice(1).toLowerCase()}
                        </span>
                      </div>
                    )}

                  {/* Category – only show if it exists */}
                  {product.category &&
                    typeof product.category === "string" &&
                    product.category.trim() && (
                      <div className="flex">
                        <span className="text-gray-500 w-24">Category:</span>
                        <span className="text-gray-900">
                          {product.category.charAt(0).toUpperCase() +
                            product.category.slice(1).toLowerCase()}
                        </span>
                      </div>
                    )}

                  {/* Price – show only if price exists and is truthy (you can adjust condition if price can be 0) */}
                  {product.price != null && (
                    <div className="flex">
                      <span className="text-gray-500 w-24">Price:</span>
                      <span className="text-gray-900">
                        {product.price}
                        {/* Optional: add currency if needed → ₦{product.price.toLocaleString()} */}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-x-3 flex items-center">
                  {product.colours?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <label className="text-gray-500 font-medium">
                        Select color:
                      </label>
                      {product.colours
                        .filter((col) => col?.value) // only colors with actual value
                        .map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setSelectedColor(col.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all
              ${
                selectedColor === col.value
                  ? "border-gray-900 scale-110"
                  : "border-gray-300"
              }`}
                            style={{ backgroundColor: col.value }}
                            title={col.value}
                          />
                        ))}
                    </div>
                  )}
                </div>

                {product.sizes?.length > 0 && (
                  <div className="space-x-3 flex items-center">
                    <label className="text-gray-500 font-medium">
                      Select size:
                    </label>

                    <select
                      value={selectedSize || ""}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                    >
                      <option value="" disabled>
                        Choose a size
                      </option>
                      {product.sizes
                        .filter(
                          (size) =>
                            size &&
                            typeof size === "string" &&
                            size.trim() !== ""
                        )
                        .map((size) => (
                          <option key={size} value={size}>
                            {size.charAt(0).toUpperCase() +
                              size.slice(1).toLowerCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="space-x-3 flex items-center">
                  <label className="text-gray-900 font-medium">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1 || isAddingToCart}
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
                      className="w-16 text-center border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                      min="1"
                      max="99"
                      disabled={isAddingToCart}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      disabled={quantity >= 99 || isAddingToCart}
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
                <div className="space-y-3 space-x-3">
                  <button
                    className="bg-[#5F1327] hover:bg-[#5F1327]/70 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !product.rawPrice}
                  >
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  {product.customize ? (
                    <button
                      className="bg-[#5F1327] hover:bg-[#5F1327]/70 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                      onClick={handleCustomize}
                      disabled={isAddingToCart}
                    >
                      Customize
                    </button>
                  ) : (
                    <button
                      className="flex-1 bg-[#5F1327] hover:bg-[#5F1327]/90 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
                      onClick={handleBuyNow}
                      disabled={isAddingToCart || !product.rawPrice}
                    >
                      {isAddingToCart ? "Processing..." : "Checkout"}
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
                <div className="text-6xl font-bold text-gray-900 mb-2">N/A</div>
                <div className="text-gray-500 mb-3">of 0 reviews</div>
                <div className="flex justify-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-gray-300 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <p className="text-gray-700 text-sm">No reviews available.</p>
              </div>
            </div>
            <div className="pt-6 text-center">
              <button className="text-gray-400 text-sm underline">
                Leave Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        categoryId={product.categoryId}
        currentProductId={product.id}
      />

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          Updating...
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
