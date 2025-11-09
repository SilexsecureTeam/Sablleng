// EditBrandForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { Upload, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const EditBrandForm = ({ brand, index, onSave, onCancel }) => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    isActive: true,
  });
  const [logo, setLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!auth.token || !brand?.id) {
        toast.error("Invalid brand or not logged in.");
        onCancel();
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.sablle.ng/api/brand/${brand.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // The brand object is directly in `data` (not `data.brands`)
        const brandData = data; // <-- THIS LINE WAS WRONG BEFORE

        setFormData({
          name: brandData.brand.name || "",
          description: brandData.brand.description || "",
          website: brandData.brand.website || "",
          isActive:
            brandData.brand.is_active === true ||
            brandData.brand.is_active === 1,
        });

        setExistingLogo(brandData.brand.logo || null);
      } catch (error) {
        console.error("Fetch brand error:", error);
        toast.error(`Failed to load brand: ${error.message}`);
        onCancel();
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [brand?.id, auth.token, onCancel]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null, api: null }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        toast.error("Only images (JPEG, PNG) under 5MB are allowed");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo({ file, url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Brand name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBrand = async () => {
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
      formDataToSend.append("_method", "PATCH");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("website", formData.website || "");
      formDataToSend.append("is_active", formData.isActive ? 1 : 0);
      if (logo) {
        formDataToSend.append("logo", logo.file);
      }

      const response = await fetch(
        `https://api.sablle.ng/api/brand/${brand.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const serverErrors = data.errors || {};
          const formattedErrors = {};
          Object.entries(serverErrors).forEach(([key, messages]) => {
            const fieldMap = {
              name: "name",
              description: "description",
              website: "website",
              is_active: "isActive",
            };
            const formField = fieldMap[key] || key;
            formattedErrors[formField] = messages.join(", ");
            toast.error(`${formField}: ${messages.join(", ")}`);
          });
          setErrors(formattedErrors);
          throw new Error("Validation failed");
        } else {
          throw new Error(data.message || "Failed to update brand");
        }
      }

      toast.success("Brand updated!");

      const updatedBrand = data; // response is the brand object directly

      onSave(
        {
          id: updatedBrand.id,
          name: updatedBrand.name || formData.name,
          description: updatedBrand.description || formData.description,
          logo: updatedBrand.logo || existingLogo,
          website: updatedBrand.website || formData.website,
          isActive: updatedBrand.is_active ?? formData.isActive,
          createdAt: updatedBrand.created_at || brand.createdAt,
        },
        index
      );
      onCancel();
    } catch (error) {
      if (error.message !== "Validation failed") {
        toast.error(`Error: ${error.message}`);
        setErrors((prev) => ({ ...prev, api: error.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">Loading brand details...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#414245] mb-1">
            Brand Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter brand name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#414245] mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#414245] mb-1">
            Website (Optional)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-4 h-4 text-[#5F1327] border-gray-300 rounded focus:ring-[#5F1327]"
            disabled={isSubmitting}
          />
          <label className="ml-2 text-sm font-medium text-[#414245]">
            Is Active
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#414245] mb-3">
            Logo
          </label>
          <div className="space-y-3">
            {logo || existingLogo ? (
              <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={logo ? logo.url : existingLogo}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
                {logo && (
                  <button
                    onClick={removeLogo}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                )}
              </div>
            ) : (
              <label className="w-32 h-32 bg-gray-300 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <Upload className="w-8 h-8 text-white" />
              </label>
            )}
          </div>
        </div>

        {errors.api && (
          <p className="text-red-600 text-sm mt-1">{errors.api}</p>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBrand}
            className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Brand"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBrandForm;
