// SupplierForm.jsx
import React, { useState, useContext } from "react";
import { X } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const SupplierForm = ({ onSave, onCancel }) => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    contact_number2: "",
    address: "",
    address_line2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    contact_person: "",
    is_active: true, // UI: boolean
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.email.includes("@")) err.email = "Valid email required";
    if (!formData.phone.trim()) err.phone = "Phone is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();

      // Send all fields
      Object.keys(formData).forEach((key) => {
        if (key === "is_active") {
          // Convert boolean to 1 or 0 (as string)
          form.append(key, formData[key] ? "1" : "0");
        } else {
          form.append(key, formData[key]);
        }
      });

      const res = await fetch("https://api.sablle.ng/api/suppliers", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          const sv = data.errors || {};
          Object.keys(sv).forEach((k) => toast.error(`${k}: ${sv[k][0]}`));
          throw new Error("Validation failed");
        }
        throw new Error(data.message || "Failed");
      }

      toast.success("Supplier created!");
      onSave({ ...data.supplier, isActive: data.supplier.is_active === 1 });
    } catch (err) {
      if (err.message !== "Validation failed") toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add New Supplier</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "name",
          "description",
          "email",
          "phone",
          "contact_number2",
          "address",
          "address_line2",
          "city",
          "state",
          "country",
          "postal_code",
          "contact_person",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-[#414245] capitalize mb-1">
              {field.replace(/_/g, " ")}
            </label>
            {field === "description" ? (
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                disabled={isSubmitting}
              />
            ) : (
              <input
                type={field.includes("email") ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                disabled={isSubmitting}
              />
            )}
            {errors[field] && (
              <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-[#5F1327] rounded"
          disabled={isSubmitting}
        />
        <label className="ml-2 text-sm font-medium text-[#414245]">
          Is Active
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Supplier"}
        </button>
      </div>
    </div>
  );
};

export default SupplierForm;
