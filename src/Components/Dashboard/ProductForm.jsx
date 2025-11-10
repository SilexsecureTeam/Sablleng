import React, { useState, useEffect, useContext } from "react";
import { Image, X, Upload } from "lucide-react";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const ProductForm = ({ onSave, onCancel }) => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    skuNumber: "",
    price: "",
    allowCustomization: false,
    description: "",
    colors: [""],
    brand: "",
    supplier: "",
    couponCode: "",
  });
  const [sizes, setSizes] = useState([""]);
  const [images, setImages] = useState({
    primary: null,
    thumbnail1: null,
    thumbnail2: null,
    thumbnail3: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  // === FETCH CATEGORIES, BRANDS, SUPPLIERS ===
  useEffect(() => {
    const fetchCategories = async () => {
      if (!auth?.token) {
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

        console.log("[Categories] Status:", response.status);
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          const text = await response.text();
          console.error("[Categories] Error HTML:", text.substring(0, 300));
          if (response.status === 401) {
            toast.error("Session expired. Redirecting to login...");
            onCancel();
            return;
          }
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(
            "[Categories] Expected JSON, got:",
            text.substring(0, 300)
          );
          throw new Error("Server returned invalid data (not JSON)");
        }

        const data = await response.json();
        const activeCategories = Array.isArray(data)
          ? data
              .filter((cat) => cat.is_active === 1)
              .map((cat) => ({ value: cat.id, label: cat.name }))
          : [];
        setCategories(activeCategories);
      } catch (error) {
        console.error("[Categories] Fetch error:", error);
        toast.error(`Error: ${error.message}`);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const res = await fetch("https://api.sablle.ng/api/brand", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Failed to load brands");
        const data = await res.json();
        const active = data.brands
          .filter((b) => b.is_active)
          .map((b) => ({ value: b.id, label: b.name }));
        setBrands(active);
      } catch (err) {
        console.error("[Brands] Fetch error:", err);
        toast.error("Failed to load brands");
      } finally {
        setIsLoadingBrands(false);
      }
    };

    const fetchSuppliers = async () => {
      setIsLoadingSuppliers(true);
      try {
        const res = await fetch("https://api.sablle.ng/api/suppliers", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Failed to load suppliers");
        const data = await res.json();
        const active = data
          .filter((s) => s.is_active === 1)
          .map((s) => ({ value: s.id, label: s.name }));
        setSuppliers(active);
      } catch (err) {
        console.error("[Suppliers] Fetch error:", err);
        toast.error("Failed to load suppliers");
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    if (auth?.token) {
      Promise.all([fetchCategories(), fetchBrands(), fetchSuppliers()]);
    }
  }, [auth?.token, onCancel]);

  // === INPUT HANDLERS ===
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

  const handleBrandChange = (opt) => {
    setFormData((prev) => ({ ...prev, brand: opt ? opt.value : "" }));
    setErrors((prev) => ({ ...prev, brand: null }));
  };

  const handleSupplierChange = (opt) => {
    setFormData((prev) => ({ ...prev, supplier: opt ? opt.value : "" }));
    setErrors((prev) => ({ ...prev, supplier: null }));
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

  const handleSizeChange = (index, value) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };

  const addSizeField = () => setSizes((prev) => [...prev, ""]);
  const removeSizeField = (index) =>
    setSizes((prev) => prev.filter((_, i) => i !== index));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = { file, url: reader.result };
      setImages((prev) => {
        if (!prev.primary) return { ...prev, primary: newImage };
        if (!prev.thumbnail1) return { ...prev, thumbnail1: newImage };
        if (!prev.thumbnail2) return { ...prev, thumbnail2: newImage };
        if (!prev.thumbnail3) return { ...prev, thumbnail3: newImage };
        toast.error("Maximum 4 images allowed");
        return prev;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageType) => {
    setImages((prev) => ({ ...prev, [imageType]: null }));
  };

  const handleApplyCoupon = () => {
    if (!formData.couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    toast.success("Coupon applied!");
  };

  // === FORM VALIDATION ===
  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim())
      newErrors.productName = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.skuNumber.trim())
      newErrors.skuNumber = "SKU number is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === SAVE PRODUCT ===
  const handleSaveProduct = async () => {
    if (!validateForm()) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    if (!auth?.token) {
      toast.error("Authentication required. Please log in.");
      onCancel();
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.productName);
    formDataToSend.append("product_code", formData.skuNumber);
    formDataToSend.append("category_id", formData.category);
    formDataToSend.append("sale_price_inc_tax", formData.price);
    formDataToSend.append("customize", formData.allowCustomization ? 1 : 0);
    formDataToSend.append("description", formData.description);

    // Sizes
    sizes.forEach((size, i) => {
      if (size.trim()) formDataToSend.append(`size[${i}]`, size.trim());
    });

    // Colors
    formData.colors.forEach((color, index) => {
      if (color.trim()) {
        formDataToSend.append(`colours[${index}]`, color.trim());
      }
    });

    // Brand & Supplier
    if (formData.brand) formDataToSend.append("brand_id", formData.brand);
    if (formData.supplier)
      formDataToSend.append("supplier_id", formData.supplier);

    // Images
    const imageKeys = ["primary", "thumbnail1", "thumbnail2", "thumbnail3"];
    imageKeys.forEach((key, index) => {
      if (images[key]?.file) {
        formDataToSend.append(`images[${index}]`, images[key].file);
      }
    });

    formDataToSend.append("coupon_code", formData.couponCode);

    try {
      const response = await fetch("https://api.sablle.ng/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formDataToSend,
      });

      console.log("[Product Save] Status:", response.status);
      let data;
      const responseText = await response.text();

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[Product Save] JSON Parse Failed:", parseError);
        console.error(
          "[Product Save] Raw HTML:",
          responseText.substring(0, 500)
        );
        throw new Error("Server returned invalid data (not JSON)");
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          onCancel();
          return;
        }

        if (response.status === 422) {
          const serverErrors = data.errors || {};
          const formattedErrors = {};
          Object.entries(serverErrors).forEach(([key, messages]) => {
            const fieldMap = {
              name: "productName",
              product_code: "skuNumber",
              category_id: "category",
              sale_price_inc_tax: "price",
              brand_id: "brand",
              supplier_id: "supplier",
              coupon_code: "couponCode",
            };
            const formField = fieldMap[key] || key;
            const msg = Array.isArray(messages)
              ? messages.join(", ")
              : messages;
            formattedErrors[formField] = msg;
            toast.error(`${formField}: ${msg}`);
          });
          setErrors({ ...errors, ...formattedErrors });
          throw new Error("Validation failed");
        }

        const errorMsg = data.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      toast.success("Product created successfully!");
      const selectedCategory = categories.find(
        (cat) => cat.value === parseInt(formData.category)
      );

      onSave({
        id: data.product.id,
        sku: data.product.product_code || formData.skuNumber,
        product: data.product.name || formData.productName,
        category:
          data.product.category?.name || selectedCategory?.label || "N/A",
        type: data.product.customize ? "Customizable" : "Non-custom",
        price: `₦${parseFloat(
          data.product.sale_price_inc_tax || formData.price
        ).toLocaleString()}`,
      });

      setFormData({
        productName: "",
        category: "",
        skuNumber: "",
        price: "",
        allowCustomization: false,
        description: "",
        colors: [""],
        brand: "",
        supplier: "",
        couponCode: "",
      });
      setSizes([""]);
      setImages({
        primary: null,
        thumbnail1: null,
        thumbnail2: null,
        thumbnail3: null,
      });
      setErrors({});
    } catch (error) {
      console.error("[Product Save] Error:", error);
      if (error.message !== "Validation failed") {
        const isHtmlError =
          /<!DOCTYPE/i.test(error.message) || /html/i.test(error.message);
        toast.error(
          isHtmlError
            ? "Server error or unauthorized. Check login status."
            : `Error: ${error.message}`
        );
        setErrors((prev) => ({ ...prev, api: error.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER ===
  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-medium text-gray-900">Create Product</h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {errors.productName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.productName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SKU Number
                  </label>
                  <input
                    type="text"
                    name="skuNumber"
                    value={formData.skuNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {errors.skuNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.skuNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Brand
                  </label>
                  <Select
                    options={brands}
                    value={brands.find((b) => b.value === formData.brand)}
                    onChange={handleBrandChange}
                    placeholder="Select Brand"
                    isLoading={isLoadingBrands}
                    isDisabled={isSubmitting || isLoadingBrands}
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
                  {errors.brand && (
                    <p className="text-red-600 text-sm mt-1">{errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier
                  </label>
                  <Select
                    options={suppliers}
                    value={suppliers.find((s) => s.value === formData.supplier)}
                    onChange={handleSupplierChange}
                    placeholder="Select Supplier"
                    isLoading={isLoadingSuppliers}
                    isDisabled={isSubmitting || isLoadingSuppliers}
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
                  {errors.supplier && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.supplier}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <Select
                    options={categories}
                    value={categories.find(
                      (cat) => cat.value === formData.category
                    )}
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
                    <p className="text-red-600 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
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
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Allow customization
                </label>
              </div>

              {/* === SIZES === */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sizes
                </label>
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      placeholder="e.g. Small, Medium, Large"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSizeField(index)}
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
                  onClick={addSizeField}
                  className="text-sm text-[#5F1327] hover:text-[#B54F5E]"
                  disabled={isSubmitting}
                >
                  + Add Size
                </button>
              </div>

              {/* === COLORS === */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Colors
                </label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      placeholder="Enter color"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
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

              <div className="space-y-3">
                <h2 className="text-base font-medium text-gray-900">
                  Coupon Management{" "}
                  <span className="text-[#5F1327]">(Optional)</span>
                </h2>
                <p className="text-sm text-gray-600">
                  Apply a specific existing coupon code to this product only.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#5F1327] text-sm text-white rounded-md hover:bg-[#B54F5E] transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Apply Code
                  </button>
                </div>
                {errors.couponCode && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.couponCode}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-medium text-gray-900">
                  Description
                </h2>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent resize-none"
                  placeholder="Enter product description..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* RIGHT: Image Upload */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-base font-medium text-gray-900 mb-4">
                  Product Images
                </h2>

                <div className="mb-4">
                  <div className="relative w-full aspect-square bg-[#5F1327] rounded-lg overflow-hidden">
                    {images.primary ? (
                      <>
                        <img
                          src={images.primary.url}
                          alt="Primary product"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage("primary")}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-[#5F1327] flex items-center justify-center">
                        <Image className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="relative w-20 h-20 bg-[#5F1327] rounded-md overflow-hidden"
                    >
                      {images[`thumbnail${n}`] ? (
                        <>
                          <img
                            src={images[`thumbnail${n}`].url}
                            alt={`Thumbnail ${n}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(`thumbnail${n}`)}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-700" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#5F1327]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="relative w-20 h-20 bg-[#5F1327] rounded-md overflow-hidden mx-auto">
                    {images.thumbnail3 ? (
                      <>
                        <img
                          src={images.thumbnail3.url}
                          alt="Thumbnail 3"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage("thumbnail3")}
                          disabled={isSubmitting}
                          className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-700" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-[#5F1327]" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Upload New Images
                  </h3>
                  <label
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer transition-colors ${
                      isSubmitting ? "" : "hover:border-gray-400"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 4 images, 5MB each
                  </p>
                </div>
              </div>
            </div>
          </div>

          {errors.api && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errors.api}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-6 py-2.5 bg-[#5F1327] text-white rounded-md hover:bg-[#B54F5E] transition-colors font-medium disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
