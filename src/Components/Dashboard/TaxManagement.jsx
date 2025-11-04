import React, { useState, useEffect, useContext } from "react";
import { Bell, Settings, Plus, X, Edit2, Trash2 } from "lucide-react";
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
  const [addForm, setAddForm] = useState({
    name: "",
    percentage: "",
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    percentage: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api";

  // Fetch Taxes
  const fetchTaxes = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
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

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok)
        throw new Error(`Failed to fetch taxes: ${response.statusText}`);

      const data = await response.json();
      const taxArray = Array.isArray(data.tax) ? data.tax : [];

      setTaxes(
        taxArray.map((t) => ({
          id: t.id,
          name: t.name || "Unnamed Tax",
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

      toast.success("Taxes loaded!", { autoClose: 2000 });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
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
    if (addForm.name) formData.append("name", addForm.name);
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

      toast.success("Tax added!", { autoClose: 3000 });
      setIsAddModalOpen(false);
      setAddForm({ name: "", percentage: "", is_active: true });
      fetchTaxes();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit
  const openEdit = (tax) => {
    setEditForm({
      name: tax.name === "Unnamed Tax" ? "" : tax.name,
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
      toast.error("Enter a valid percentage.");
      return;
    }

    setIsEditing(true);

    try {
      const payload = {
        percentage: editForm.percentage,
        is_active: editForm.is_active ? 1 : 0,
      };
      if (editForm.name) payload.name = editForm.name;

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

      toast.success("Tax updated!", { autoClose: 3000 });
      setIsEditModalOpen(false);
      fetchTaxes();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsEditing(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tax?")) return;

    try {
      const response = await fetch(`${API_BASE}/taxes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete tax");
      }

      toast.success("Tax deleted!", { autoClose: 3000 });
      fetchTaxes();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" />

      {/* Top Bar */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tax Rate
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
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
                <div className="absolute top-4 right-4 flex gap-1">
                  <button
                    onClick={() => openEdit(tax)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tax.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pr-12">
                  <h2 className="text-sm font-medium text-[#5F1327] mb-1">
                    {tax.name}
                  </h2>
                  <h3 className="text-2xl font-bold text-[#414245] mb-2">
                    {tax.percentage}%
                  </h3>
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#141718]">
                Add Tax Rate
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={addForm.name}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. VAT, Sales Tax"
                />
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
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
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add Tax"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#141718]">
                Edit Tax Rate
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. VAT, Sales Tax"
                />
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
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
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
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
