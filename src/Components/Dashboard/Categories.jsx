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
    tag: null,
  });
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    tag: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Tag Change
  const handleTagChange = (selectedOption, isEdit = false) => {
    const setter = isEdit ? setEditFormData : setAddFormData;
    setter((prev) => ({ ...prev, tag: selectedOption || null }));
  };

  // Add Category
  const handleAddInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      const file = files[0];
      setAddFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAddImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) return toast.error("Name required.");
    if (!addFormData.tag) return toast.error("Tag required.");

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
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success("Category added!");
      setIsAddModalOpen(false);
      setAddFormData({ name: "", description: "", image: null, tag: null });
      setAddImagePreview(null);
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
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return toast.error("Name required.");
    if (!editFormData.tag) return toast.error("Tag required.");

    setIsEditing(true);
    const submitData = {
      name: editFormData.name,
      description: editFormData.description,
      is_active: editFormData.is_active,
      tag_id: editFormData.tag.value,
    };

    try {
      const res = await fetch(
        `https://api.sablle.ng/api/categories/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(submitData),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success("Category updated!");
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // DELETE: Open Confirm Modal
  const confirmDelete = (id, name) => {
    setDeletingId(id);
    setDeletingName(name);
    setIsDeleteModalOpen(true);
  };

  // DELETE: Confirm Action
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
      loadData(); // Refresh list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Main Load Function
  const loadData = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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

      const catsRes = await fetch("https://api.sablle.ng/api/categories", {
        headers: {
          "Content-Type": "application/json",
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

  // Search
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

  // Initial Load
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
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
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
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white"
              >
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
                      className="p-1 text-green-600 hover:text-green--800"
                      title="View Products"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pr-20">
                  <h2 className="text-base font-semibold text-[#141718] mb-1">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[#6C7275] mb-1">
                    Tag: {category.tagName}
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
                  name="name"
                  value={addFormData.name}
                  onChange={handleAddInputChange}
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
                  name="description"
                  value={addFormData.description}
                  onChange={handleAddInputChange}
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
              <div>
                <label className="block text-sm font-medium text-[#414245] mb-1">
                  Category Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {addImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={addImagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAddFormData((prev) => ({ ...prev, image: null }));
                          setAddImagePreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleAddInputChange}
                        className="hidden"
                      />
                      <div className="text-gray-500">
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  )}
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

      {/* DELETE CONFIRM MODAL */}
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
