import React, { useState, useEffect, useContext } from "react";
import {
  Bell,
  Settings,
  Zap,
  X,
  Edit2,
  Trash2,
  Search,
  Eye,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

const Tags = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    is_active: true,
    image: null,
    imagePreview: null,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    is_active: true,
    image: null,
    imagePreview: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch tags
  const fetchTags = async (search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `https://api.sablle.ng/api/tags`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      let tagsArray = Array.isArray(data.data) ? data.data : data;

      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        tagsArray = tagsArray.filter((tag) =>
          tag.name?.toLowerCase().includes(lowerSearch)
        );
      }

      const formattedTags = tagsArray.map((tag) => ({
        id: tag.id,
        name: tag.name,
        is_active: tag.is_active,
        status: tag.is_active ? "Active" : "Inactive",
        categoryNames: tag.categories?.map((c) => c.name).join(", ") || "None",
        image_url: tag.image_url || null,
      }));

      setTags(formattedTags);
      toast.success(`Loaded ${formattedTags.length} tags!`, {
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags(searchQuery);
  }, [auth.token, navigate, searchQuery]);

  // Handle image change (shared for add & edit)
  const handleImageChange = (e, setForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
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
    setForm((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  // Add Tag
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }

    setIsAdding(true);
    const submitData = new FormData();
    submitData.append("name", addFormData.name);
    submitData.append("is_active", addFormData.is_active ? "1" : "0");
    if (addFormData.image) {
      submitData.append("image", addFormData.image);
    }

    try {
      const response = await fetch("https://api.sablle.ng/api/tags", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed: ${response.statusText}`);
      }

      toast.success("Tag added!", { autoClose: 3000 });
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        is_active: true,
        image: null,
        imagePreview: null,
      });
      fetchTags(searchQuery);
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsAdding(false);
    }
  };

  // Edit Tag
  const handleEdit = (tag) => {
    setEditingId(tag.id);
    setEditFormData({
      name: tag.name,
      is_active: tag.status === "Active",
      image: null,
      imagePreview: tag.image_url || null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);

    const submitData = new FormData();
    submitData.append("_method", "PATCH");
    submitData.append("name", editFormData.name);
    submitData.append("is_active", editFormData.is_active ? "1" : "0");
    if (editFormData.image) {
      submitData.append("image", editFormData.image);
    }

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/tags/${editingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: submitData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed: ${response.statusText}`);
      }

      toast.success("Tag updated!", { autoClose: 3000 });
      setIsEditModalOpen(false);
      fetchTags(searchQuery);
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    } finally {
      setIsEditing(false);
    }
  };

  // Delete Tag
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tag?")) return;

    try {
      const res = await fetch(`https://api.sablle.ng/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!res.ok) throw new Error("Failed to delete.");

      toast.success("Tag deleted!");
      fetchTags(searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Can perform="tags.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Top Bar */}
        <div className="flex justify-end items-center mb-6 gap-3">
          <Can perform="tags.create">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Add Tag
            </button>
          </Can>
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
          <h1 className="text-lg font-semibold text-[#141718] mb-6">
            Product Tags
          </h1>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Loading tags...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No tags found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white flex items-start gap-4"
                >
                  {/* Tag Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                    {tag.image_url ? (
                      <img
                        src={tag.image_url}
                        alt={tag.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Tag Info */}
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-[#141718] mb-1">
                      {tag.name}
                    </h2>
                  </div>

                  {/* Status & Actions */}
                  <div className="absolute top-4 right-4 space-y-1">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded block ${
                        tag.status === "Active"
                          ? "bg-[#EAFFD8] text-[#1B8401]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tag.status}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <Can perform="tags.edit">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Can>
                      <Can perform="tags.view">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/tags/${tag.id}/categories`)
                          }
                          className="p-1 text-green-600 hover:text-green-800"
                          title="View Categories"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Can>
                      <Can perform="tags.delete">
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Can>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#141718]">
                  Add New Tag
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
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) =>
                      setAddFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    placeholder="e.g. Christmas"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#414245] mb-2">
                    Tag Image <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {addFormData.imagePreview ? (
                        <img
                          src={addFormData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                        <Upload className="w-4 h-4" />
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
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addFormData.is_active}
                    onChange={(e) =>
                      setAddFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
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
                    {isAdding ? "Adding..." : "Add Tag"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#141718]">
                  Edit Tag
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
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#414245] mb-2">
                    Tag Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {editFormData.imagePreview ? (
                        <img
                          src={editFormData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                        <Upload className="w-4 h-4" />
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
                          className="mt-2 block text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
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
                    {isEditing ? "Updating..." : "Update Tag"}
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

export default Tags;
