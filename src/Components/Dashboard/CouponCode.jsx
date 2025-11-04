import React, { useState, useEffect, useContext } from "react";
import { Bell, Settings, Plus, X, Edit2, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";

const CouponCode = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add Modal (updated: usage_limit optional)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    promotion_name: "",
    code: "",
    type: "percent",
    value: "",
    start_date: "",
    expires_at: "",
    usage_limit: "",
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal (unchanged)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    promotion_name: "",
    code: "",
    value: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null); // Store full coupon for display
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api";

  // Fetch Coupons (unchanged)
  const fetchCoupons = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/coupons`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok)
        throw new Error(`Failed to fetch coupons: ${response.statusText}`);

      const data = await response.json();
      const couponArray = Array.isArray(data.coupons) ? data.coupons : [];

      setCoupons(
        couponArray.map((c) => ({
          id: c.id,
          title: c.promotion_name || "Unnamed Coupon",
          code: c.code,
          type: c.type,
          discount: Number(c.value || 0), // Coerce to number with fallback
          start_date: c.start_date,
          expires_at: c.expires_at,
          startDate: new Date(c.start_date).toLocaleDateString("en-GB"),
          endDate: new Date(c.expires_at).toLocaleDateString("en-GB"),
          usage_limit: c.usage_limit,
          uses: `${c.times_used || 0}/${c.usage_limit || 0}`,
          status: c.is_active ? "Active" : "Inactive",
          is_active:
            c.is_active === 1 || c.is_active === "1" || c.is_active === true,
          updated_at: new Date(c.updated_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }))
      );

      toast.success("Coupons loaded!", { autoClose: 2000 });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setCoupons([]);
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => navigate("/admin/signin"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [auth.token, navigate]);

  // Handle Add (updated: make usage_limit optional)
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
      !addForm.code ||
      !addForm.value ||
      isNaN(addForm.value) ||
      addForm.value <= 0 ||
      !addForm.start_date ||
      !addForm.expires_at
    ) {
      toast.error("Please fill all required fields with valid values.", {
        position: "top-right",
      });
      return;
    }
    // FIX: Optional usage_limit validation
    if (
      addForm.usage_limit &&
      (isNaN(addForm.usage_limit) || addForm.usage_limit < 0)
    ) {
      toast.error(
        "Usage limit must be a valid non-negative number if provided."
      );
      return;
    }

    setIsAdding(true);
    const formData = new FormData();
    if (addForm.promotion_name)
      formData.append("promotion_name", addForm.promotion_name);
    formData.append("code", addForm.code);
    formData.append("type", addForm.type);
    formData.append("value", addForm.value);
    formData.append("start_date", addForm.start_date);
    formData.append("expires_at", addForm.expires_at);
    // FIX: Append usage_limit only if provided
    if (addForm.usage_limit) {
      formData.append("usage_limit", addForm.usage_limit);
    }
    formData.append("is_active", addForm.is_active ? "1" : "0");

    try {
      const response = await fetch(`${API_BASE}/coupons`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add coupon");
      }

      toast.success("Coupon added!", { autoClose: 3000 });
      setIsAddModalOpen(false);
      setAddForm({
        promotion_name: "",
        code: "",
        type: "percent",
        value: "",
        start_date: "",
        expires_at: "",
        usage_limit: "",
        is_active: true,
      });
      fetchCoupons();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit (unchanged)
  const openEdit = (coupon) => {
    setEditForm({
      promotion_name: coupon.title === "Unnamed Coupon" ? "" : coupon.title,
      code: coupon.code,
      value: coupon.discount, // Set value for editing
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setEditingCoupon(coupon); // Store full for display
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
      !editForm.code ||
      !editForm.value ||
      isNaN(editForm.value) ||
      editForm.value <= 0
    ) {
      toast.error("Please fill the code and value fields with valid values.");
      return;
    }

    setIsEditing(true);

    try {
      const formData = new FormData();
      if (editForm.promotion_name)
        formData.append("promotion_name", editForm.promotion_name);
      formData.append("code", editForm.code);
      formData.append("value", editForm.value); // Append value
      formData.append("is_active", editForm.is_active ? "1" : "0");
      formData.append("_method", "PATCH");

      const response = await fetch(`${API_BASE}/coupons/${editingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update coupon");
      }

      toast.success("Coupon updated!", { autoClose: 3000 });
      setIsEditModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsEditing(false);
    }
  };

  // Handle Delete (unchanged)
  const handleDelete = async (id) => {
    // if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`${API_BASE}/coupons/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete coupon");
      }

      toast.success("Coupon deleted!", { autoClose: 3000 });
      fetchCoupons();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  // PromotionCard Component (updated: conditional styling for inactive)
  const PromotionCard = ({
    title,
    code,
    discount,
    startDate,
    endDate,
    uses,
    status,
    type,
    coupon,
    onEdit,
    onDelete,
  }) => {
    const displayDiscount = discount || 0;
    const symbol = type === "percent" ? "%" : "₦";
    // FIX: Conditional classes for status badge
    const isActive = status === "Active";
    const badgeClasses = isActive
      ? "bg-[#EAFFD8] text-[#1B8401]"
      : "bg-red-100 text-red-700"; // Red for inactive
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
        <div className="absolute top-4 right-4 flex gap-1">
          <button
            onClick={() => onEdit(coupon)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(coupon.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="pr-16">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm text-[#333333] mb-1">{title}</h3>
              <p className="text-xs text-[#333333]">{code}</p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClasses}`}
            >
              {status}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-[#333333]">
              {displayDiscount} {symbol}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[#5E5E5E]">Start: {startDate}</p>
            <p className="text-xs text-[#5E5E5E]">End: {endDate}</p>
            <p className="text-xs text-[#333333] font-medium mt-2">{uses}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#414245] p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Top Bar (unchanged) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Promotions</h1>
          <p className="text-sm md:text-base mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Promotion
          </button>
        </div>
      </div>
      {/* Main Card (unchanged) */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#414245] mb-6">
          Promotions
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading coupons...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={fetchCoupons}
              className="mt-4 px-4 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#B54F5E]"
            >
              Retry
            </button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No promotions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <PromotionCard
                key={coupon.id}
                title={coupon.title}
                code={coupon.code}
                discount={coupon.discount}
                startDate={coupon.startDate}
                endDate={coupon.endDate}
                uses={coupon.uses}
                status={coupon.status}
                type={coupon.type}
                coupon={coupon}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      {/* Add Modal (updated: remove required from usage_limit input) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#141718]">
                Create Promotion
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
                  Promotion Name (Optional)
                </label>
                <input
                  type="text"
                  name="promotion_name"
                  value={addForm.promotion_name}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. Black Friday Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={addForm.code}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. BLACKFRIDAY25"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={addForm.type}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₦)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Value
                </label>
                <input
                  type="number"
                  name="value"
                  value={addForm.value}
                  onChange={handleAddChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. 20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={addForm.start_date}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Expires At
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={addForm.expires_at}
                  onChange={handleAddChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  name="usage_limit"
                  value={addForm.usage_limit}
                  onChange={handleAddChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={addForm.is_active}
                  className="mr-2"
                  onChange={handleAddChange}
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
                  {isAdding ? "Adding..." : "Create Promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal (unchanged) */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#141718]">
                Edit Promotion
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Read-only display for non-editable fields */}
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">
                    Type:{" "}
                    <span className="font-medium">
                      {editingCoupon.type === "percent"
                        ? "Percentage (%)"
                        : "Fixed Amount (₦)"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    Start:{" "}
                    <span className="font-medium">
                      {editingCoupon.startDate}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    End:{" "}
                    <span className="font-medium">{editingCoupon.endDate}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Usage:{" "}
                    <span className="font-medium">{editingCoupon.uses}</span>
                  </p>
                </div>
              </div>

              {/* Editable fields */}
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Promotion Name (Optional)
                </label>
                <input
                  type="text"
                  name="promotion_name"
                  value={editForm.promotion_name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. Black Friday Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={editForm.code}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Value
                </label>
                <input
                  type="number"
                  name="value"
                  value={editForm.value}
                  onChange={handleEditChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. 20"
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
                  {isEditing ? "Updating..." : "Update Promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCode;
