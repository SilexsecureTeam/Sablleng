// src/Components/Dashboard/ProductView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Edit3 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProductForm from "./EditProductForm";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // === FETCH FULL PRODUCT ===
  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.sablle.ng/api/products/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // === FORMAT DATE ===
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // === OPEN EDIT MODAL ===
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // === CLOSE EDIT MODAL ===
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  // === AFTER SAVE: REFETCH FULL PRODUCT ===
  const handleUpdateProduct = async () => {
    setIsEditModalOpen(false);
    toast.success("Product updated! Refreshing view...");

    try {
      await fetchProduct(); // Refetch fresh data
    } catch (err) {
      setError(err.message);
      toast.error("Failed to refresh product view.");
    }
  };

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F1327]"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[#5F1327] hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto">
        {/* === HEADER === */}
        <div className="bg-white rounded-t-lg shadow-sm p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#5F1327] hover:text-[#B54F5E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <h1 className="text-2xl font-bold text-[#141718] flex items-center gap-2">
              <Package className="w-6 h-6 text-[#5F1327]" />
              {product.name}
            </h1>

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#B54F5E] transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Edit Product
            </button>
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="bg-white rounded-b-lg shadow-sm p-6 space-y-8">
          {/* === IMAGES === */}
          {product.images && product.images.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-[#141718] mb-4">
                Product Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((img, i) => (
                  <div
                    key={img.id || i}
                    className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200"
                  >
                    <img
                      src={img.url}
                      alt={`Product ${i + 1}`}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              No images available
            </div>
          )}

          {/* === CORE DETAILS === */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#141718] mb-4">
                Product Details
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">SKU</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {product.product_code}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Category</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {product.category?.name || "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Type</dt>
                  <dd className="text-sm font-medium">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        product.customize
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {product.customize ? "Customizable" : "Non-custom"}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Colors</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {Array.isArray(product.colours) &&
                    product.colours.length > 0
                      ? product.colours.map((c) => c.value).join(", ")
                      : "None"}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Brand</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {product.brand?.name || "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Supplier</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {product.supplier?.name || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#141718] mb-4">
                Pricing
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Sale Price</dt>
                  <dd className="text-sm font-bold text-green-600">
                    ₦{parseFloat(product.sale_price_inc_tax).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Cost Price</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    ₦{parseFloat(product.cost_inc_tax).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Tax Exempt</dt>
                  <dd className="text-sm font-medium">
                    {product.tax_exempt_eligible ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-600 font-medium">No</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Barcode</dt>
                  <dd className="text-sm font-medium text-[#141718]">
                    {product.barcode || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* === DESCRIPTION === */}
          <div>
            <h3 className="text-lg font-semibold text-[#141718] mb-3">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* === META INFO === */}
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 border-t pt-6">
            <div>
              <span className="font-medium text-gray-800">Created:</span>{" "}
              {formatDate(product.created_at)}
            </div>
            <div>
              <span className="font-medium text-gray-800">Updated:</span>{" "}
              {formatDate(product.updated_at)}
            </div>
          </div>

          {/* === BOTTOM EDIT BUTTON === */}
          <div className="flex justify-center pt-6 border-t">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-[#5F1327] text-white rounded-lg hover:bg-[#B54F5E] transition-colors font-medium shadow-md"
            >
              <Edit3 className="w-5 h-5" />
              Edit Product
            </button>
          </div>
        </div>
      </div>

      {/* === EDIT MODAL === */}
      {isEditModalOpen && product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={{
                id: product.id,
                sku: product.product_code,
                product: product.name,
                category: product.category?.name || "N/A",
                type: product.customize ? "Customizable" : "Non-custom",
                price: `₦${parseFloat(
                  product.sale_price_inc_tax
                ).toLocaleString()}`,
              }}
              index={0}
              onSave={handleUpdateProduct}
              onCancel={handleCloseEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;
