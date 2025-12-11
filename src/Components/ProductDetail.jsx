import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUploadComponent from "./ImageUploadComponent";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState({
    index: 0,
    bgColor: "bg-gray-50",
    image: null,
  });
  const sliderRef = useRef(null);

  const colorStyle = (value) => ({
    backgroundColor: value,
  });

  // Define thumbnails using actual product images (up to 4, cycle bg colors if fewer)
  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-red-100",
    "bg-yellow-100",
  ];
  const thumbnails = product?.images
    ? product.images.map((img, index) => ({
        bgColor: bgColors[index % bgColors.length],
        image: img,
      }))
    : [];

  // Sample sizes (replace with dynamic sizes from API)
  const sizes = product?.sizes?.length > 0 ? product.sizes : ["no size"];

  useEffect(() => {
    const fetchProduct = async () => {
      // Check cache first (instant repeat visits)
      const cacheKey = `product_${id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const {
          product: cachedProduct,
          related,
          timestamp,
        } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // 5 min cache
          setProduct(cachedProduct);
          setRelatedProducts(related || []);
          setIsLoading(false);
          // Restore selections
          setSelectedSize(cachedProduct.sizes?.[0] || "no size");
          if (cachedProduct.colours?.length > 0) {
            setSelectedColor(cachedProduct.colours[0].value);
          }
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const productId = parseInt(id);

        // PARALLEL FETCH — this is the big win
        const [productResponse, allProductsResponse] = await Promise.all([
          fetch(`https://api.sablle.ng/api/products/${productId}`),
          fetch(`https://api.sablle.ng/api/products?per_page=100`), // adjust if you know limit
        ]);

        if (!productResponse.ok) {
          const err = await productResponse.json().catch(() => ({}));
          throw new Error(err.message || "Product not found");
        }

        const data = await productResponse.json();
        const formattedProduct = {
          /* ← keep your exact formatting logic */ id: data.id,
          name: data.name || "",
          rawPrice: data.sale_price_inc_tax
            ? parseFloat(data.sale_price_inc_tax)
            : 0,
          price: data.sale_price_inc_tax
            ? `₦${parseFloat(data.sale_price_inc_tax).toLocaleString()}`
            : "Price Unavailable",
          category: data.category?.name || "Uncategorized",
          badge: data.customize ? "Customizable" : null,
          images: data.images?.map(
            (img) => img.url || `https://api.sablle.ng/storage/${img.path}`
          ) || ["/placeholder-image.jpg"],
          image:
            data.images?.[0]?.url ||
            (data.images?.[0]?.path
              ? `https://api.sablle.ng/storage/${data.images[0].path}`
              : "/placeholder-image.jpg"),
          model: data.product_code || "N/A",
          customize: data.customize,
          sizes: data.size || null,
          brand: data.brand?.name || "no brand",
          supplier: data.supplier?.name || "no supplier",
          colours: data.colour || [],
          description: data.description || "",
        };

        let related = [];
        if (
          formattedProduct.category !== "Uncategorized" &&
          allProductsResponse.ok
        ) {
          const allData = await allProductsResponse.json();
          const list = Array.isArray(allData.data) ? allData.data : [];
          related = list
            .filter(
              (p) =>
                p.category?.name === formattedProduct.category &&
                p.id !== productId
            )
            .slice(0, 10)
            .map((p) => ({
              id: p.id,
              name: p.name || "",
              price: p.sale_price_inc_tax
                ? `₦${parseFloat(p.sale_price_inc_tax).toLocaleString()}`
                : "Price Unavailable",
              category: p.category?.name || "Uncategorized",
              badge: p.customize ? "Customizable" : null,
              image:
                p.images?.[0]?.url ||
                (p.images?.[0]?.path
                  ? `https://api.sablle.ng/storage/${p.images[0].path}`
                  : "/placeholder-image.jpg"),
            }));
        }

        // Cache for next visit
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            product: formattedProduct,
            related,
            timestamp: Date.now(),
          })
        );

        setProduct(formattedProduct);
        setRelatedProducts(related);
        setSelectedSize(formattedProduct.sizes?.[0] || "no size");
        if (formattedProduct.colours?.length > 0) {
          setSelectedColor(formattedProduct.colours[0].value);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

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

  // const handleOrderNow = () => {
  //   toast.info("Order now feature coming soon!", {
  //     position: "top-right",
  //     autoClose: 3000,
  //   });
  //   console.log("Order Now clicked for", product?.name);
  // };

  const handleAddToCart = async () => {
    if (!product) {
      // toast.error("Product information not available");
      return;
    }

    setIsAddingToCart(true);

    try {
      const price = product.rawPrice;

      if (!price || price <= 0) {
        // toast.error("Invalid product price");
        return;
      }

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
      // toast.success(`${product.name} added to cart!`, {
      //   position: "top-right",
      //   autoClose: 3000,
      // });
    } catch (error) {
      console.error("Error adding to cart:", error);
      // toast.error("Failed to add item to cart. Please try again.", {
      //   position: "top-right",
      //   autoClose: 5000,
      // });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      // toast.error("Product not available");
      return;
    }

    setIsAddingToCart(true);

    try {
      const price = product.rawPrice;

      if (!price || price <= 0) {
        // toast.error("Invalid product price");
        return;
      }

      // Add item to cart (same as normal add)
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

      // Success toast
      // toast.success(`1 item added! Taking you to checkout...`, {
      //   position: "top-right",
      //   autoClose: 2000,
      // });

      // Redirect straight to delivery (skip cart page)
      setTimeout(() => {
        navigate("/delivery");
      }, 800);
    } catch (error) {
      console.error("Buy Now failed:", error);
      // toast.error("Failed to process. Please try again.");
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

  if (error || !product) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {error || "Product not found"}
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
      {/* <ToastContainer /> */}
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
                  <img
                    src={
                      selectedThumbnail.image ||
                      product.images?.[0] ||
                      product.image
                    }
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
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {product.name.charAt(0).toUpperCase() +
                    product.name.slice(1).toLowerCase()}
                </h1>
                <p className="text-gray-600 text-xl leading-relaxed">
                  {product.description
                    ? product.description.charAt(0).toUpperCase() +
                      product.description.slice(1).toLowerCase()
                    : ""}
                </p>

                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-gray-500 w-24">Color:</span>
                    <span className="text-gray-900">
                      {selectedColor.charAt(0).toUpperCase() +
                        selectedColor.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {/* <div className="flex">
                    <span className="text-gray-500 w-24">Size:</span>
                    <span className="text-gray-900">
                      {product.sizes
                        ? product.sizes.join(", ") || "no size"
                        : "no size"}
                    </span>
                  </div> */}
                  <div className="flex">
                    <span className="text-gray-500 w-24">Brand:</span>
                    <span className="text-gray-900">
                      {product.brand.charAt(0).toUpperCase() +
                        product.brand.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Suppliers:</span>
                    <span className="text-gray-900">
                      {product.supplier.charAt(0).toUpperCase() +
                        product.supplier.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {/* <div className="flex">
                    <span className="text-gray-500 w-24">Material:</span>
                    <span className="text-gray-900">Premium</span>
                  </div> */}
                  <div className="flex">
                    <span className="text-gray-500 w-24">Category:</span>
                    <span className="text-gray-900">
                      {product.category.charAt(0).toUpperCase() +
                        product.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Price:</span>
                    <span className="text-gray-900">
                      {product.price.charAt(0).toUpperCase() +
                        product.price.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="space-x-3 flex items-center">
                  <label className="text-gray-900 font-medium">
                    Select color:
                  </label>

                  <div className="flex space-x-3">
                    {product.colours?.length > 0 ? (
                      product.colours.map((col) => {
                        return (
                          <button
                            key={col.id}
                            onClick={() => setSelectedColor(col.value)}
                            style={colorStyle(col.value)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              selectedColor ===
                              col.value.charAt(0).toUpperCase() +
                                col.value.slice(1).toLowerCase()
                                ? "border-gray-800"
                                : "border-gray-300"
                            }`}
                          />
                        );
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No colors available
                      </span>
                    )}
                  </div>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-x-3 flex items-center">
                    <label className="text-gray-900 font-medium">
                      Select size:
                    </label>
                    <div className="flex space-x-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1 rounded border ${
                            selectedSize === size
                              ? "bg-[#5F1327] text-white border-[#5F1327]"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          } transition-colors`}
                          disabled={sizes.length === 1 && size === "no size"}
                        >
                          {size.charAt(0).toUpperCase() +
                            size.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
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

      {/* Related Products Slider */}
      <React.Suspense fallback={<div className="h-96 bg-gray-50" />}>
        {relatedProducts.length > 0 && (
          <div className="max-w-[1200px] mx-auto p-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Related Products
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={scrollLeft}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    Left Arrow
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    Right Arrow
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
                      className="block hover:shadow-lg transition-shadow"
                    >
                      <div className="relative bg-[#F4F2F2] p-4 h-48 flex items-center justify-center">
                        {relatedProduct.badge && (
                          <div className="absolute top-6 left-0 bg-[#5F1327] text-white px-8 py-2 rounded text-sm font-medium">
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
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </React.Suspense>
    </div>
  );
};

export default ProductDetail;
