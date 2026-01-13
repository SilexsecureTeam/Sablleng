import React, { useState, useEffect, useContext } from "react";
import {
  Zap,
  X,
  Edit2,
  Trash2,
  Search,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

const HeroSlides = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    link_url: "",
    order: "",
    image: null,
    imagePreview: null,
    is_active: true, // kept for future
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    link_url: "",
    order: "",
    image: null,
    imagePreview: null,
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api/hero-slides";

  const fetchSlides = async (search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) throw new Error("Unauthorized");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      let slideList = Array.isArray(data.data) ? data.data : [];

      if (search.trim()) {
        const q = search.toLowerCase();
        slideList = slideList.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.link_url?.toLowerCase().includes(q)
        );
      }

      // Sort by order (lowest first) so admin sees real display order
      slideList.sort(
        (a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999)
      );

      setSlides(slideList);
      toast.success(`Loaded ${slideList.length} slides`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load slides: ${err.message}`);
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides(searchQuery);
  }, [auth.token, searchQuery]);

  const handleImageChange = (e, setForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (setForm) => {
    setForm((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  // ── ADD ───────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (
      !addFormData.order ||
      isNaN(addFormData.order) ||
      Number(addFormData.order) < 1
    ) {
      toast.error("Valid order number ≥ 1 is required");
      return;
    }

    setIsAdding(true);
    const formData = new FormData();
    formData.append("title", addFormData.title);
    formData.append("link_url", addFormData.link_url || "");
    formData.append("order", addFormData.order);
    // is_active sent but ignored by backend - kept for future
    formData.append("is_active", addFormData.is_active ? "1" : "0");
    if (addFormData.image) formData.append("image", addFormData.image);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create slide");
      }

      toast.success("Slide created!");
      setIsAddModalOpen(false);
      setAddFormData({
        title: "",
        link_url: "",
        order: "",
        image: null,
        imagePreview: null,
        is_active: true,
      });
      fetchSlides(searchQuery);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // ── EDIT ──────────────────────────────────────────────
  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setEditFormData({
      title: slide.title || "",
      link_url: slide.link_url || "",
      order: slide.order?.toString() || "",
      image: null,
      imagePreview: slide.image_url || null,
      is_active: true, // default true since field doesn't exist
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (
      !editFormData.order ||
      isNaN(editFormData.order) ||
      Number(editFormData.order) < 1
    ) {
      toast.error("Valid order number ≥ 1 is required");
      return;
    }

    const newOrder = Number(editFormData.order);

    // Very explicit duplicate check with type coercion
    const isDuplicate = slides.some((s) => {
      const sOrder = Number(s.order) || 0;
      const sId = Number(s.id);
      const editIdNum = Number(editingId);
      return sOrder === newOrder && sId !== editIdNum;
    });

    if (isDuplicate) {
      if (
        !window.confirm(
          `Order ${newOrder} is already used by another slide.\n\nContinue anyway? (this may cause two slides to appear in the same position)`
        )
      ) {
        return;
      }
    }

    setIsEditing(true);
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("title", editFormData.title);
    formData.append("link_url", editFormData.link_url || "");
    formData.append("order", editFormData.order);
    formData.append("is_active", editFormData.is_active ? "1" : "0");
    if (editFormData.image) formData.append("image", editFormData.image);

    try {
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update slide");
      }

      toast.success("Slide updated!");
      setIsEditModalOpen(false);
      fetchSlides(searchQuery);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hero slide?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Slide deleted");
      fetchSlides(searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Auto-fill next order when opening ADD modal
  const openAddModal = () => {
    let nextOrder = "1";
    if (slides.length > 0) {
      const maxOrder = Math.max(...slides.map((s) => Number(s.order) || 0));
      nextOrder = (maxOrder + 1).toString();
    }
    setAddFormData((prev) => ({ ...prev, order: nextOrder }));
    setIsAddModalOpen(true);
  };

  return (
    <Can perform="hero-slides.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header / Add Button */}
        <div className="flex justify-end items-center mb-6 gap-3">
          <Can perform="hero-slides.create">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Add Hero Slide
            </button>
          </Can>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#141718] mb-6">
            Hero Slider Management
          </h1>

          {/* Search */}
          <div className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading slides...
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No slides found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-100 relative">
                    {slide.image_url ? (
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {/* Removed active badge because field doesn't exist */}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-[#141718] mb-1 line-clamp-2">
                      {slide.title || "No title"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                      {slide.link_url || "—"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Order: {slide.order ?? "?"}</span>
                      <div className="flex gap-2">
                        <Can perform="hero-slides.edit">
                          <button
                            onClick={() => handleEdit(slide)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        </Can>
                        <Can perform="hero-slides.delete">
                          <button
                            onClick={() => handleDelete(slide.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </Can>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-[#141718]">
                  Add New Hero Slide
                </h2>
                <button onClick={() => setIsAddModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={addFormData.title}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    placeholder="e.g. Up to 50% Off Confectionaries"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={addFormData.link_url}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        link_url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://your-site.com/groups/for-her"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={addFormData.order}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, order: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hero Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {addFormData.imagePreview ? (
                        <img
                          src={addFormData.imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                        <Upload size={16} />
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, setAddFormData)}
                          className="hidden"
                        />
                      </label>
                      {addFormData.imagePreview && (
                        <button
                          type="button"
                          onClick={() => removeImage(setAddFormData)}
                          className="mt-2 text-xs text-red-600 block"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox kept, but has no real effect yet */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addFormData.is_active}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        is_active: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">
                    Active (will be used in future)
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 py-2.5 bg-[#5F1327] text-white rounded-lg hover:bg-[#8B1A3A] disabled:opacity-50"
                  >
                    {isAdding ? "Creating..." : "Create Slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-[#141718]">
                  Edit Hero Slide
                </h2>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.link_url}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        link_url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={editFormData.order}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        order: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hero Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {editFormData.imagePreview ? (
                        <img
                          src={editFormData.imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : editFormData.imagePreview === null &&
                        editFormData.image === null ? (
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      ) : null}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                        <Upload size={16} />
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(e, setEditFormData)
                          }
                          className="hidden"
                        />
                      </label>
                      {editFormData.imagePreview && (
                        <button
                          type="button"
                          onClick={() => removeImage(setEditFormData)}
                          className="mt-2 text-xs text-red-600 block"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox kept for future */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        is_active: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">
                    Active (will be used in future)
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 py-2.5 bg-[#5F1327] text-white rounded-lg hover:bg-[#8B1A3A] disabled:opacity-50"
                  >
                    {isEditing ? "Updating..." : "Update Slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Can>
  );
};

export default HeroSlides;
