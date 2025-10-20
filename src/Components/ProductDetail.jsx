import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUploadComponent from "./ImageUploadComponent";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);
  const { auth } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(true); // Always show customization
  const sliderRef = useRef(null);

  useEffect(() => {
    console.log("ProductDetail: Auth state:", {
      isAuthenticated: auth?.isAuthenticated,
      hasToken: !!auth?.token,
      tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
    });
  }, [auth]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.sablle.ng/api/products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        const productsArray = Array.isArray(data.data) ? data.data : [];

        const formattedProducts = productsArray.map((item) => ({
          id: item.id,
          name: item.name || "",
          rawPrice: item.sale_price_inc_tax
            ? parseFloat(item.sale_price_inc_tax)
            : 0,
          price: item.sale_price_inc_tax
            ? `₦${parseFloat(item.sale_price_inc_tax).toLocaleString()}`
            : "₦0",
          category: item.category?.name || "",
          badge: item.is_variable_price ? "Customizable" : null,
          image: item.images?.[0] || "/placeholder-image.jpg",
          model: item.product_code || "N/A",
        }));

        const foundProduct = formattedProducts.find(
          (p) => p.id === parseInt(id)
        );

        if (!foundProduct) {
          throw new Error("Product not found");
        }

        setProduct(foundProduct);
        setRelatedProducts(
          formattedProducts.filter(
            (p) =>
              p.category === foundProduct.category && p.id !== foundProduct.id
          )
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB5B6A] mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading product...</p>
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
          className="text-[#CB5B6A] underline mt-4 inline-block"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 md:py-10">
      <ToastContainer />
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white p-8">
          <ImageUploadComponent
            product={product}
            auth={auth}
            onBack={() => setIsCustomizing(false)}
          />
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
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Scroll left"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
      )}
    </div>
  );
};

export default ProductDetail;
