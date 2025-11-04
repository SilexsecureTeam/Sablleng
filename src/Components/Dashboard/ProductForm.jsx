import React, { useState, useEffect, useContext } from "react";
import { Image, X } from "lucide-react";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const ProductForm = ({ onSave, onCancel }) => {
  const { auth } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    skuNumber: "",
    price: "",
    // availableStock: "",
    allowCustomization: false,
    images: [],
    description: "",
    colors: [""],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!auth.token) {
        toast.error("Please log in again.");
        onCancel();
        return;
      }

      setIsLoadingCategories(true);
      try {
        const response = await fetch("https://api.sablle.ng/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.status === 401) throw new Error("Unauthorized.");
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

        const data = await response.json();
        const activeCategories = Array.isArray(data)
          ? data
              .filter((cat) => cat.is_active === 1)
              .map((cat) => ({ value: cat.id, label: cat.name }))
          : [];
        setCategories(activeCategories);
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [auth.token, onCancel]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null, api: null }));
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      category: selectedOption ? selectedOption.value : "",
    }));
    setErrors((prev) => ({ ...prev, category: null, api: null }));
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const addColorField = () => {
    setFormData((prev) => ({ ...prev, colors: [...prev.colors, ""] }));
  };

  const removeColorField = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files
      .filter(
        (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
      )
      .slice(0, 4 - formData.images.length)
      .map((file) => ({ url: URL.createObjectURL(file), file }));
    if (files.length > validImages.length) {
      toast.error("Only images (JPEG, PNG) under 5MB are allowed");
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validImages].slice(0, 4),
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim())
      newErrors.productName = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.skuNumber.trim())
      newErrors.skuNumber = "SKU number is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    // if (!formData.availableStock || formData.availableStock < 0)
    //   newErrors.availableStock = "Valid stock is required";
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) setStep(2);
    else Object.values(errors).forEach((error) => toast.error(error));
  };

  const handleCancel = () => {
    if (step === 2) setStep(1);
    else {
      setFormData({
        productName: "",
        category: "",
        skuNumber: "",
        price: "",
        // availableStock: "",
        allowCustomization: false,
        images: [],
        description: "",
        colors: [""],
      });
      setErrors({});
      onCancel();
    }
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    if (!auth.token) {
      toast.error("Please log in again.");
      onCancel();
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.productName);
      formDataToSend.append("product_code", formData.skuNumber);
      formDataToSend.append("category_id", formData.category);
      formDataToSend.append("sale_price_inc_tax", formData.price);
      // formDataToSend.append("stock_quantity", formData.availableStock);
      formDataToSend.append("customize", formData.allowCustomization ? 1 : 0);
      formDataToSend.append("description", formData.description);
      formData.colors.forEach((color, index) => {
        if (color.trim())
          formDataToSend.append(`colours[${index}]`, color.trim());
      });
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image.file);
      });

      const response = await fetch("https://api.sablle.ng/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const serverErrors = data.errors || {};
          const formattedErrors = {};
          Object.entries(serverErrors).forEach(([key, messages]) => {
            const fieldMap = {
              product_code: "skuNumber",
              name: "productName",
              category_id: "category",
              sale_price_inc_tax: "price",
              // stock_quantity: "availableStock",
            };
            const formField = fieldMap[key] || key;
            formattedErrors[formField] = messages.join(", ");
            toast.error(`${formField}: ${messages.join(", ")}`);
          });
          setErrors(formattedErrors);
          throw new Error("Validation failed");
        } else {
          throw new Error(data.message || "Failed to create product");
        }
      }

      toast.success("Product created!");
      const selectedCategory = categories.find(
        (cat) => cat.value === parseInt(formData.category)
      );
      onSave({
        id: data.product.id,
        sku: data.product.product_code || formData.skuNumber,
        product: data.product.name,
        category:
          data.product.category?.name || selectedCategory?.label || "N/A",
        type: data.product.customize ? "Customizable" : "Non-custom",
        price: `₦${parseFloat(
          data.product.sale_price_inc_tax || formData.price
        ).toLocaleString()}`,
        // stock: data.product.stock_quantity || formData.availableStock,
      });
      setFormData({
        productName: "",
        category: "",
        skuNumber: "",
        price: "",
        // availableStock: "",
        allowCustomization: false,
        images: [],
        description: "",
        colors: [""],
      });
      setErrors({});
      setStep(1);
    } catch (error) {
      if (error.message !== "Validation failed") {
        toast.error(`Error: ${error.message}`);
        setErrors((prev) => ({ ...prev, api: error.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#414245] mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter Product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.productName && (
              <p className="text-red-600 text-sm mt-1">{errors.productName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#414245] mb-1">
              Product Category
            </label>
            <Select
              options={categories}
              value={categories.find((cat) => cat.value === formData.category)}
              onChange={handleCategoryChange}
              placeholder="Select Product Category"
              isLoading={isLoadingCategories}
              isDisabled={isSubmitting || isLoadingCategories}
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#9ca3af" },
                  "&:focus-within": {
                    borderColor: "#5F1327",
                    boxShadow: "0 0 0 1px #5F1327",
                  },
                }),
              }}
            />
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#414245] mb-1">
              SKU Number
            </label>
            <input
              type="text"
              name="skuNumber"
              value={formData.skuNumber}
              onChange={handleInputChange}
              placeholder="1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.skuNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.skuNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#414245] mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-[#414245] mb-1">
                Available Stock
              </label>
              <input
                type="number"
                name="availableStock"
                value={formData.availableStock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.availableStock && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.availableStock}
                </p>
              )}
            </div> */}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowCustomization"
              checked={formData.allowCustomization}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#5F1327] border-gray-300 rounded focus:ring-[#5F1327]"
              disabled={isSubmitting}
            />
            <label className="ml-2 text-sm font-medium text-[#414245]">
              Allow customization
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#414245] mb-1">
              Colors
            </label>
            {formData.colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="Enter color"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                  disabled={isSubmitting}
                />
                {formData.colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColorField(index)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addColorField}
              className="text-sm text-[#5F1327] hover:text-[#B54F5E]"
              disabled={isSubmitting}
            >
              + Add Color
            </button>
          </div>

          {errors.api && (
            <p className="text-red-600 text-sm mt-1">{errors.api}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
              disabled={isSubmitting || isLoadingCategories}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#414245] mb-3">
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
            <label className="block text-sm font-medium text-[#414245] mb-1">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent resize-none"
              placeholder="Enter product description..."
              disabled={isSubmitting}
            />
          </div>

          {errors.api && (
            <p className="text-red-600 text-sm mt-1">{errors.api}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-8 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-8 py-2 bg-[#5F1327] text-white rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
