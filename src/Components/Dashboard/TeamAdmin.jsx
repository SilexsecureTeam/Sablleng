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

const TeamAdmin = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    position: "",
    bio: "",
    photo: null,
    photoPreview: null,
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    position: "",
    bio: "",
    photo: null,
    photoPreview: null,
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api/teams";

  const fetchMembers = async (search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      let memberList = Array.isArray(data) ? data : data.data || data || [];

      if (search.trim()) {
        const q = search.toLowerCase();
        memberList = memberList.filter(
          (m) =>
            m.name?.toLowerCase().includes(q) ||
            m.position?.toLowerCase().includes(q) ||
            m.bio?.toLowerCase().includes(q)
        );
      }

      setMembers(memberList);
      toast.success(`Loaded ${memberList.length} team members`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load team: ${err.message}`);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(searchQuery);
  }, [auth.token, searchQuery]);

  const handleImageChange = (e, formSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please select an image");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image must be under 5MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      formSetter((prev) => ({
        ...prev,
        photo: file,
        photoPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (formSetter) => {
    formSetter((prev) => ({ ...prev, photo: null, photoPreview: null }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim() || !addFormData.position.trim()) {
      toast.error("Name and Position are required");
      return;
    }

    setIsAdding(true);
    const formData = new FormData();
    formData.append("name", addFormData.name);
    formData.append("position", addFormData.position);
    formData.append("bio", addFormData.bio || "");
    formData.append("is_active", addFormData.is_active ? "1" : "0");
    if (addFormData.photo) formData.append("photo", addFormData.photo);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add member");
      }

      toast.success("Team member added!");
      setIsAddModalOpen(false);
      setAddFormData({
        name: "",
        position: "",
        bio: "",
        photo: null,
        photoPreview: null,
        is_active: true,
      });
      fetchMembers(searchQuery);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditFormData({
      name: member.name || "",
      position: member.position || "",
      bio: member.bio || "",
      photo: null, // new file upload
      photoPreview: member.photo || null, // use full URL directly
      is_active: member.is_active ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.position.trim()) {
      toast.error("Name and Position are required");
      return;
    }

    setIsEditing(true);
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("name", editFormData.name);
    formData.append("position", editFormData.position);
    formData.append("bio", editFormData.bio || "");
    formData.append("is_active", editFormData.is_active ? "1" : "0");
    if (editFormData.photo) formData.append("photo", editFormData.photo);

    try {
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Update failed");
      }

      toast.success("Team member updated!");
      setIsEditModalOpen(false);
      fetchMembers(searchQuery);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member? This cannot be undone."))
      return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Team member deleted");
      fetchMembers(searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Can perform="teams.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex justify-end items-center mb-6 gap-3">
          <Can perform="teams.create">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Add Team Member
            </button>
          </Can>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#141718] mb-6">
            Team Management
          </h1>

          <div className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, position or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No team members found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-100 relative">
                    {member.photo ? (
                      <img
                        src={member.photo} // ← use full URL directly
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png"; // fallback
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-[#141718] mb-1">
                      {member.name || "Unnamed"}
                    </h3>
                    <p className="text-sm text-[#5F1327] mb-2">
                      {member.position || "—"}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {member.bio || "No bio provided"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Active: {member.is_active ? "Yes" : "No"}</span>
                      <div className="flex gap-3">
                        <Can perform="teams.edit">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        </Can>
                        <Can perform="teams.delete">
                          <button
                            onClick={() => handleDelete(member.id)}
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
                  Add New Team Member
                </h2>
                <button onClick={() => setIsAddModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={addFormData.position}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    rows={4}
                    value={addFormData.bio}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, bio: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg resize-y"
                    placeholder="Short description or achievements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {addFormData.photoPreview ? (
                        <img
                          src={addFormData.photoPreview}
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
                        Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, setAddFormData)}
                          className="hidden"
                        />
                      </label>
                      {addFormData.photoPreview && (
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
                  <label className="text-sm font-medium">Active</label>
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
                    {isAdding ? "Adding..." : "Add Member"}
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
                  Edit Team Member
                </h2>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={editFormData.position}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    rows={4}
                    value={editFormData.bio}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bio: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg resize-y"
                    placeholder="Short description or achievements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current / New Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {editFormData.photoPreview ? (
                        <img
                          src={editFormData.photoPreview}
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
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(e, setEditFormData)
                          }
                          className="hidden"
                        />
                      </label>
                      {editFormData.photoPreview && (
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
                  <label className="text-sm font-medium">Active</label>
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
                    {isEditing ? "Updating..." : "Update Member"}
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

export default TeamAdmin;
