import React, { useState, useEffect, useContext } from "react";
import {
  Bell,
  Settings,
  Zap,
  X,
  Edit2,
  Eye,
  Search,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const Categories = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: null,
    tag: null,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    tag: null,
    image: null,
    imagePreview: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Base URL for images (adjust if your storage is served differently)
  const IMAGE_BASE_URL = "https://api.sablle.ng/storage/";

  // Handle Tag Change
  const handleTagChange = (selectedOption, isEdit = false) => {
    const setter = isEdit ? setEditFormData : setAddFormData;
    setter((prev) => ({ ...prev, tag: selectedOption || null }));
  };

  // Handle image change (shared for add & edit)
  const handleImageChange = (e, isEdit = false) => {
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
      const setter = isEdit ? setEditFormData : setAddFormData;
      setter((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (isEdit = false) => {
    const setter = isEdit ? setEditFormData : setAddFormData;
    setter((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  // Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) return toast.error("Name is required.");
    if (!addFormData.tag) return toast.error("Tag is required.");

    setIsAdding(true);
    const submitData = new FormData();
    submitData.append("name", addFormData.name);
    submitData.append("description", addFormData.description || "");
    submitData.append("tag_id", addFormData.tag.value);
    if (addFormData.image) submitData.append("image", addFormData.image);

    try {
      const res = await fetch("https://api.sablle.ng/api/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: submitData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add category");
      }

      toast.success("Category added successfully!");
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        description: "",
        image: null,
        imagePreview: null,
        tag: null,
      });
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Edit Category
  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
      tag: tags.find((t) => t.value === category.tag_id) || null,
      image: null, // new file only
      imagePreview: category.image
        ? `${IMAGE_BASE_URL}${category.image}`
        : null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return toast.error("Name is required.");
    if (!editFormData.tag) return toast.error("Tag is required.");

    setIsEditing(true);

    const submitData = new FormData();
    submitData.append("_method", "PATCH");
    submitData.append("name", editFormData.name);
    submitData.append("description", editFormData.description || "");
    submitData.append("is_active", editFormData.is_active ? "1" : "0");
    submitData.append("tag_id", editFormData.tag.value);

    // Image handling
    if (editFormData.image instanceof File) {
      submitData.append("image", editFormData.image);
    } else if (editFormData.image === null && !editFormData.imagePreview) {
      // If user removed image completely → send empty to remove
      submitData.append("image", "");
    }
    // If neither → don't send → keep existing image

    try {
      const res = await fetch(
        `https://api.sablle.ng/api/categories/${editingId}`,
        {
          method: "POST", // Laravel accepts PATCH via _method in FormData
          headers: { Authorization: `Bearer ${auth.token}` },
          body: submitData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update category");
      }

      toast.success("Category updated successfully!");
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // Delete
  const confirmDelete = (id, name) => {
    setDeletingId(id);
    setDeletingName(name);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `https://api.sablle.ng/api/categories/${deletingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete");
      }

      toast.success(`"${deletingName}" deleted!`);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      setDeletingName("");
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load Data
  const loadData = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Tags
      const tagsRes = await fetch("https://api.sablle.ng/api/tags", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!tagsRes.ok) throw new Error("Failed to load tags");
      const tagsData = await tagsRes.json();
      const tagsArray = Array.isArray(tagsData.data) ? tagsData.data : tagsData;
      const tagOptions = tagsArray.map((t) => ({ value: t.id, label: t.name }));
      setTags(tagOptions);

      const tagNameMap = {};
      tagOptions.forEach((t) => (tagNameMap[t.value] = t.label));

      // Categories
      const catsRes = await fetch("https://api.sablle.ng/api/categories", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!catsRes.ok) throw new Error("Failed to load categories");
      const catsData = await catsRes.json();
      const catsArray = Array.isArray(catsData.data) ? catsData.data : catsData;

      const formatted = catsArray.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        tag_id: item.tag_id,
        tagName: item.tag_id ? tagNameMap[item.tag_id] || "Unknown" : "None",
        status: item.is_active ? "Active" : "Inactive",
        is_active: item.is_active,
        image: item.image || null, // ← added
      }));

      setAllCategories(formatted);
      setCategories(formatted);
      toast.success(`Loaded ${formatted.length} categories!`, {
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setAllCategories([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCategories(allCategories);
      return;
    }
    const filtered = allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setCategories(filtered);
  }, [searchQuery, allCategories]);

  useEffect(() => {
    loadData();
  }, [auth.token, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-end items-center mb-6 gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[#141718] mb-6">
          Products Category
        </h1>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white flex items-start gap-4"
              >
                {/* Category Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                  {category.image ? (
                    <img
                      src={`${IMAGE_BASE_URL}${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/fallback-placeholder.jpg"; // optional fallback
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 pr-20">
                  <h2 className="text-base font-semibold text-[#141718] mb-1">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[#6C7275] mb-1">
                    Tag: {category.tagName}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="absolute top-4 right-4 space-y-1">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded block ${
                      category.status === "Active"
                        ? "bg-[#EAFFD8] text-[#1B8401]"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {category.status}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(category.id, category.name)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/categories/${category.id}/products`
                        )
                      }
                      className="p-1 text-green-600 hover:text-green-800"
                      title="View Products"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
                Add New Category
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
                  Category Name
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
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Description
                </label>
                <textarea
                  value={addFormData.description}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Tag
                </label>
                <Select
                  options={tags}
                  value={addFormData.tag}
                  onChange={(opt) => handleTagChange(opt, false)}
                  placeholder="Select a tag..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-2">
                  Category Image{" "}
                  <span className="text-gray-500">(Optional)</span>
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
                        onChange={(e) => handleImageChange(e, false)}
                        className="hidden"
                      />
                    </label>
                    {addFormData.imagePreview && (
                      <button
                        type="button"
                        onClick={() => removeImage(false)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 block"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
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
                  {isAdding ? "Adding..." : "Add Category"}
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
                Edit Category
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
                  Category Name
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

              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Tag
                </label>
                <Select
                  options={tags}
                  value={editFormData.tag}
                  onChange={(opt) => handleTagChange(opt, true)}
                  placeholder="Select a tag..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-2">
                  Category Image
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
                        onChange={(e) => handleImageChange(e, true)}
                        className="hidden"
                      />
                    </label>
                    {editFormData.imagePreview && (
                      <button
                        type="button"
                        onClick={() => removeImage(true)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 block"
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
                  {isEditing ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#141718]">
                Delete Category?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{deletingName}"</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
