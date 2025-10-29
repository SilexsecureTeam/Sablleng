import React, { useState, useEffect, useContext } from "react";
import { Bell, Settings, Plus, X, Edit2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";

const TaxManagement = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ percentage: "", is_active: true });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ percentage: "", is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api";

  // Fetch Taxes
  const fetchTaxes = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/taxes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch taxes: ${response.statusText}`);
      }

      const data = await response.json();
      const taxArray = Array.isArray(data.tax) ? data.tax : [];

      setTaxes(
        taxArray.map((t) => ({
          id: t.id,
          percentage: t.percentage,
          is_active:
            t.is_active === 1 || t.is_active === "1" || t.is_active === true,
          updated_at: new Date(t.updated_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }))
      );

      toast.success("Taxes loaded!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      setTaxes([]);
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => navigate("/admin/signin"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [auth.token, navigate]);

  // Handle Add
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !addForm.percentage ||
      isNaN(addForm.percentage) ||
      addForm.percentage <= 0
    ) {
      toast.error("Enter a valid percentage.", { position: "top-right" });
      return;
    }

    setIsAdding(true);
    const formData = new FormData();
    formData.append("percentage", addForm.percentage);
    formData.append("is_active", addForm.is_active ? "1" : "0");

    try {
      const response = await fetch(`${API_BASE}/taxes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add tax");
      }

      toast.success("Tax added!", { position: "top-right", autoClose: 3000 });
      setIsAddModalOpen(false);
      setAddForm({ percentage: "", is_active: true });
      fetchTaxes();
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit
  const openEdit = (tax) => {
    setEditForm({
      percentage: tax.percentage,
      is_active: tax.is_active,
    });
    setEditingId(tax.id);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (
      !editForm.percentage ||
      isNaN(editForm.percentage) ||
      editForm.percentage <= 0
    ) {
      toast.error("Enter a valid percentage.", { position: "top-right" });
      return;
    }

    setIsEditing(true);

    try {
      const payload = {
        percentage: editForm.percentage,
        is_active: editForm.is_active ? 1 : 0,
      };

      const response = await fetch(`${API_BASE}/taxes/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update tax");
      }

      const result = await response.json();
      console.log("Update response:", result); // Debug

      toast.success("Tax updated!", { position: "top-right", autoClose: 3000 });
      setIsEditModalOpen(false);
      fetchTaxes(); // This will now show correct data
    } catch (err) {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer />
      {/* Top Bar */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#B34949] text-white rounded-md hover:bg-[#B34949]/80 cursor-pointer transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Promotion
        </button>
        <button className="relative p-2 hover:bg-gray-200 rounded-md">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-md">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[#414245] mb-6">Tax Rates</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading taxes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : taxes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No tax rates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxes.map((tax) => (
              <div
                key={tax.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white"
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => openEdit(tax)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pr-12">
                  <h2 className="text-2xl font-bold text-[#414245] mb-2">
                    {tax.percentage}%
                  </h2>
                  <p className="text-sm text-[#414245] mb-1">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        tax.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tax.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {tax.updated_at}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-[#414245]">
                Add Tax Rate
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={addForm.percentage}
                  onChange={handleAddChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 7.5"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={addForm.is_active}
                  onChange={handleAddChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-[#414245]">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Tax"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-[#414245]">
                Edit Tax Rate
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={editForm.percentage}
                  onChange={handleEditChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editForm.is_active}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-[#414245]">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEditing ? "Updating..." : "Update Tax"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxManagement;
