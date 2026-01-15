import React, { useState, useEffect, useContext } from "react";
import { X, Edit2, Image as ImageIcon, Upload } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

const AboutUsAdmin = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal (only one since single record)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    heading: "",
    content: "",
    founder_name: "",
    founder_title: "",
    founder_image: null,
    founder_image_preview: null,
    is_active: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "https://api.sablle.ng/api/about-us";

  const fetchAbout = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.");
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      const record = data.data || null;
      setAboutData(record);

      if (record) {
        setEditFormData({
          heading: record.heading || "",
          content: record.content || "",
          founder_name: record.founder_name || "",
          founder_title: record.founder_title || "",
          founder_image: null,
          founder_image_preview: record.founder_image
            ? `https://api.sablle.ng/storage/${record.founder_image}`
            : null,
          is_active: record.is_active ?? true,
        });
      }
      toast.success("About Us loaded");
    } catch (err) {
      toast.error(err.message);
      setAboutData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, [auth.token]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image < 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditFormData((prev) => ({
        ...prev,
        founder_image: file,
        founder_image_preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setEditFormData((prev) => ({
      ...prev,
      founder_image: null,
      founder_image_preview: null,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.heading.trim() || !editFormData.content.trim()) {
      toast.error("Heading and content required");
      return;
    }

    setIsEditing(true);
    const formData = new FormData();
    formData.append("heading", editFormData.heading);
    formData.append("content", editFormData.content); // \n preserved
    formData.append("founder_name", editFormData.founder_name);
    formData.append("founder_title", editFormData.founder_title);
    formData.append("is_active", editFormData.is_active ? "1" : "0");
    if (editFormData.founder_image) {
      formData.append("founder_image", editFormData.founder_image); // or "image" if backend expects that
    }

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      toast.success("About Us updated!");
      setIsEditModalOpen(false);
      fetchAbout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Can perform="about-us.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex justify-end mb-6">
          <Can perform="about-us.edit">
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={!aboutData}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              <Edit2 size={18} />
              Edit About Us
            </button>
          </Can>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#141718] mb-6">
            About Us / Our Story Management
          </h1>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : !aboutData ? (
            <div className="text-center py-12 text-gray-500">
              No About Us data found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="border rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-medium mb-4">
                  {aboutData.heading}
                </h2>
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {aboutData.content}
                </div>
                <div className="mt-8 flex items-center gap-6">
                  {aboutData.founder_image && (
                    <img
                      src={`https://api.sablle.ng/storage/${aboutData.founder_image}`}
                      alt="Founder"
                      className="w-32 h-32 object-cover rounded-full border"
                    />
                  )}
                  <div>
                    <p className="font-medium">{aboutData.founder_name}</p>
                    <p className="text-sm text-gray-600">
                      {aboutData.founder_title}
                    </p>
                  </div>
                </div>
                {/* <p className="mt-4 text-sm text-gray-500">
                  Active: {aboutData.is_active ? "Yes" : "No"}
                </p> */}
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Edit About Us</h2>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
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
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content * (use Enter for line breaks)
                  </label>
                  <textarea
                    rows={10}
                    value={editFormData.content}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg resize-y"
                    placeholder="Paragraph one...\n\nParagraph two..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Founder Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.founder_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          founder_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Founder Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.founder_title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          founder_title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Founder Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {editFormData.founder_image_preview ? (
                        <img
                          src={editFormData.founder_image_preview}
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
                        Choose/Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {editFormData.founder_image_preview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="mt-2 text-xs text-red-600 block"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center ">
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
                </div> */}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 py-2.5 bg-[#5F1327] text-white rounded-lg hover:bg-[#8B1A3A]"
                  >
                    {isEditing ? "Updating..." : "Update About Us"}
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

export default AboutUsAdmin;
