// src/Components/Dashboard/ProductView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductView = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.sablle.ng/api/products/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data);
        toast.success("Product details fetched successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate("/dashboard/product-list");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6 font-poppins">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#B34949] hover:text-[#9e0205] transition-colors"
              aria-label="Back to product list"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Products</span>
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Product Details
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading product details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  General Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Product Name
                    </span>
                    <p className="text-base text-gray-900">{product.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      SKU
                    </span>
                    <p className="text-base text-gray-900">
                      {product.product_code}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Category
                    </span>
                    <p className="text-base text-gray-900">
                      {product.category?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Type
                    </span>
                    <p className="text-base text-gray-900">
                      {product.is_variable_price
                        ? "Customizable"
                        : "Non-custom"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Pricing & Stock
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Sale Price (Inc. Tax)
                    </span>
                    <p className="text-base text-gray-900">
                      N{parseFloat(product.sale_price_inc_tax).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Cost Price (Inc. Tax)
                    </span>
                    <p className="text-base text-gray-900">
                      N{parseFloat(product.cost_inc_tax).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Stock
                    </span>
                    <p className="text-base text-gray-900">
                      {product.stock || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-base text-gray-900">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Additional Details
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Barcode
                  </span>
                  <p className="text-base text-gray-900">
                    {product.barcode || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Created At
                  </span>
                  <p className="text-base text-gray-900">
                    {new Date(product.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Updated At
                  </span>
                  <p className="text-base text-gray-900">
                    {new Date(product.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Images (if available) */}
            {product.images && product.images.length > 0 ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Images
                </h2>
                <p className="text-base text-gray-500">No images available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No product data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;
