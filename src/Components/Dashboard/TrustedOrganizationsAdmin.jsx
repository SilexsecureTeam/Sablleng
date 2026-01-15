import React, { useState, useEffect, useContext } from "react";
import { X, Edit2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

const TrustedOrganizationsAdmin = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    heading: "",
    is_active: true,
    newLogos: [], // array of selected File objects for upload
    newLogosPreviews: [], // array of preview URLs (data: URLs)
  });
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api/trusted-organizations";

  const fetchSections = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.");
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
      if (!res.ok) throw new Error("Failed to load trusted organizations");

      const data = await res.json();
      const allSections = Array.isArray(data.data) ? data.data : [];
      setSections(allSections);

      toast.success(`Loaded ${allSections.length} section(s)`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load: ${err.message}`);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [auth.token]);

  // Handle multiple logo file selection + previews
  const handleLogoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const previews = files.map((file) => URL.createObjectURL(file));

    setEditFormData((prev) => ({
      ...prev,
      newLogos: [...prev.newLogos, ...files],
      newLogosPreviews: [...prev.newLogosPreviews, ...previews],
    }));
  };

  // Remove a pending new logo (before submit)
  const removeNewLogo = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      newLogos: prev.newLogos.filter((_, i) => i !== index),
      newLogosPreviews: prev.newLogosPreviews.filter((_, i) => i !== index),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.heading.trim()) {
      toast.error("Heading is required");
      return;
    }

    setIsEditing(true);
    const formData = new FormData();
    formData.append("heading", editFormData.heading);
    formData.append("is_active", editFormData.is_active ? "1" : "0");

    // Append each new logo file as logos[]
    editFormData.newLogos.forEach((file) => {
      formData.append("logos[]", file);
    });

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save section");
      }

      toast.success("Section saved successfully!");
      setIsEditModalOpen(false);
      setEditFormData({
        heading: "",
        is_active: true,
        newLogos: [],
        newLogosPreviews: [],
      });
      fetchSections();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this section? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Delete failed");
      }

      toast.success("Section deleted successfully");
      fetchSections();
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const openEditModal = (section = null) => {
    if (section) {
      // Edit existing
      setEditFormData({
        heading: section.heading || "",
        is_active: section.is_active ?? true,
        newLogos: [],
        newLogosPreviews: [],
      });
    } else {
      // Create new (clear form)
      setEditFormData({
        heading: "",
        is_active: true,
        newLogos: [],
        newLogosPreviews: [],
      });
    }
    setIsEditModalOpen(true);
  };

  return (
    <Can perform="trusted-organizations.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex justify-end items-center mb-6 gap-3">
          <Can perform="trusted-organizations.edit">
            <button
              onClick={() => openEditModal()}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <Edit2 size={18} />
              {sections.length === 0
                ? "Create Trusted Section"
                : "Create New Section"}
            </button>
          </Can>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#141718] mb-6">
            Trusted Organizations Management
          </h1>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading sections...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No trusted sections found. Create one above.
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-6 bg-gray-50 relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">{section.heading}</h2>
                    <div className="flex items-center gap-3">
                      {/* <span className="text-sm text-gray-500">
                        ID: {section.id}
                      </span> */}
                      <Can perform="trusted-organizations.delete">
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Section"
                          disabled={isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </Can>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">
                    Logos count: {section.logos?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Active: {section.is_active ? "Yes" : "No"}
                  </p>

                  {section.logos?.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {section.logos.map((logo) => (
                        <div
                          key={logo.id}
                          className="flex flex-col items-center"
                        >
                          <img
                            src={logo.url}
                            alt={logo.name || "Logo"}
                            className="w-full h-24 object-contain border rounded p-2 bg-white"
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                            {logo.name || "Unnamed"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500 italic">
                      No logos in this section yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit / Create Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-[#141718]">
                  {editFormData.heading ? "Edit" : "Create"} Trusted Section
                </h2>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Heading *
                  </label>
                  <input
                    type="text"
                    value={editFormData.heading}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        heading: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload New Logos (multiple allowed)
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                    <Upload size={16} />
                    Choose Logos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>

                  {editFormData.newLogosPreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {editFormData.newLogosPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-contain border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewLogo(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    {isEditing ? "Saving..." : "Save Section"}
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

export default TrustedOrganizationsAdmin;
