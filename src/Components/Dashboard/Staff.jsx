import React, { useState, useEffect, useContext } from "react";
import { Search, Plus, Edit2, Trash2, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const API_BASE = "https://api.sablle.ng/api";

const Staff = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      toast.error("Access denied.");
      navigate("/admin/signin");
    }
  }, [auth, navigate]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/staff`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to load staff");

      const formatted = result.data.map((s) => ({
        id: s.id,
        name: s.name || "N/A",
        email: s.email,
        phone: s.phone || "N/A",
        role: s.role,
        roleDisplay: s.role
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        joined: new Date(s.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }));

      setStaff(formatted);
      setFilteredStaff(formatted);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchAvailableRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const result = await res.json();

      if (res.ok && result.data) {
        // Sort admin first, then others
        const sorted = result.data.sort((a, b) => {
          if (a.name === "admin") return -1;
          if (b.name === "admin") return 1;
          return a.name.localeCompare(b.name);
        });
        setAvailableRoles(sorted);
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
      toast.error("Could not load roles list");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (auth.token) fetchAvailableRoles();
    fetchStaff();
  }, [auth.token]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = staff.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.roleDisplay.toLowerCase().includes(query)
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staff]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Staff deleted");
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateRole = async (newRole) => {
    const payload = new FormData();
    payload.append("role", newRole);
    payload.append("_method", "PATCH");

    try {
      const res = await fetch(`${API_BASE}/admin/users/${selectedStaff.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: payload,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");
      toast.success("Role updated!");
      fetchStaff();
      setIsRoleModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#141718] mb-2">
              Staff Management
            </h1>
            <p className="text-[#6C7275]">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div> */}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              All Staff Members
            </h2>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200 text-[#414245]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs text-center  font-medium bg-[#5F1327] text-white">
                          {s.roleDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.joined}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStaff(s);
                              setIsRoleModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Edit Modal */}
      {isRoleModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Change Staff Role</h3>
            <div className="mb-4 text-sm">
              <p className="font-medium">{selectedStaff.name}</p>
              <p className="text-gray-500">{selectedStaff.email}</p>
            </div>

            <div className="mb-3 text-sm">
              <span className="text-gray-600">Current role: </span>
              <span className="font-medium">
                {selectedStaff?.role
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ") || "None"}
              </span>
            </div>

            <select
              defaultValue={selectedStaff?.role}
              onChange={(e) => handleUpdateRole(e.target.value)}
              disabled={loadingRoles}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F1327] text-sm mb-5"
            >
              {loadingRoles ? (
                <option>Loading roles...</option>
              ) : availableRoles.length === 0 ? (
                <option>No roles available</option>
              ) : (
                availableRoles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))
              )}
            </select>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedStaff(null);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
