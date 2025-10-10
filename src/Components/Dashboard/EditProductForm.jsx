import React, { useState, useEffect } from "react";
import { Image, X } from "lucide-react";

const EditProductForm = ({ product, index, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    skuNumber: "",
    price: "",
    availableStock: "",
    allowCustomization: false,
    images: [],
    description: "",
  });

  // Pre-populate form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.product,
        category: product.category,
        skuNumber: product.sku,
        price: product.price.replace("N", "").replace(/,/g, ""), // Remove 'N' and commas
        availableStock: product.stock.toString(),
        allowCustomization: product.type === "Customizable",
        images: [], // Images not used in product list
        description: "", // Description not used in product list
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 4 - formData.images.length);

    const imageUrls = newImages.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls].slice(0, 4),
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onCancel();
    }
  };

  const handleSaveProduct = () => {
    onSave(formData, index);
    setFormData({
      productName: "",
      category: "",
      skuNumber: "",
      price: "",
      availableStock: "",
      allowCustomization: false,
      images: [],
      description: "",
    });
  };

  return (
    <div className="p-8">
      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter Product name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Product Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-400 appearance-none bg-white"
              >
                <option value="">Select Product Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food & Beverage</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports & Outdoors</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                SKU Number
              </label>
              <input
                type="text"
                name="skuNumber"
                value={formData.skuNumber}
                onChange={handleInputChange}
                placeholder="1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Available Stock
              </label>
              <input
                type="number"
                name="availableStock"
                value={formData.availableStock}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowCustomization"
              id="allowCustomization"
              checked={formData.allowCustomization}
              onChange={handleInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="allowCustomization"
              className="ml-2 text-sm text-gray-700"
            >
              Allow customization
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-3">
              Upload product images
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  {formData.images[index] ? (
                    <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={formData.images[index].url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <X className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="block aspect-square bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                      />
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-white" />
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Enter product description..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductForm;
