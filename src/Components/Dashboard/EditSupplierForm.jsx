// EditSupplierForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";

const EditSupplierForm = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth === null || auth === undefined) return;

    if (!auth?.token) {
      toast.error("Please log in to continue.");
      navigate("/admin/signin");
      return;
    }

    if (!id) {
      toast.error("Invalid supplier ID.");
      setError("Invalid supplier ID.");
      setIsLoading(false);
      return;
    }

    const fetchSupplier = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://api.sablle.ng/api/suppliers/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const s = data;

        if (!s || !s.id) throw new Error("Invalid supplier data");

        setFormData({
          name: s.name || "",
          description: s.description || "",
          email: s.email || "",
          phone: s.phone || "",
          contact_number2: s.contact_number2 || "",
          address: s.address || "",
          address_line2: s.address_line2 || "",
          city: s.city || "",
          state: s.state || "",
          country: s.country || "",
          postal_code: s.postal_code || "",
          contact_person: s.contact_person || "",
          is_active: s.is_active === 1,
        });
      } catch (err) {
        const msg = err.message || "Failed to load supplier";
        toast.error(msg);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [auth, id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading supplier...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate("/dashboard/suppliers")}
              className="px-4 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#B54F5E]"
            >
              Back to Suppliers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No supplier data.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("_method", "PATCH");
      Object.keys(formData).forEach((k) => {
        form.append(
          k,
          k === "is_active" ? (formData[k] ? "1" : "0") : formData[k]
        );
      });

      const res = await fetch(`https://api.sablle.ng/api/suppliers/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          Object.keys(data.errors || {}).forEach((k) =>
            toast.error(`${k}: ${data.errors[k][0]}`)
          );
          throw new Error("Validation failed");
        }
        throw new Error(data.message || "Update failed");
      }

      toast.success("Supplier updated!");
      navigate("/dashboard/suppliers");
    } catch (err) {
      if (err.message !== "Validation failed") toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard/suppliers")}
            className="flex items-center gap-1 text-[#5F1327] hover:text-[#B54F5E]"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-[#141718]">
            Edit Supplier
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
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
                    rows={3}
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

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate("/dashboard/suppliers")}
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
              {isSubmitting ? "Updating..." : "Update Supplier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierForm;
