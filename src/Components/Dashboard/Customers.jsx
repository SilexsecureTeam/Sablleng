import React, { useState, useEffect, useContext } from "react";
import { Search, Settings, Bell, Plus, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.sablle.ng/api";

const Customers = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const customersPerPage = 10;

  // Role Edit Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Auth Guard
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      toast.error("Please log in to view customers.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/signin"), 2000);
    }
  }, [auth, navigate]);

  // Fetch Users
  const fetchCustomers = async () => {
    if (!auth.token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to load customers");

      const formatted = (result.users || []).map((user) => ({
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "N/A",
        phone: user.phone || "N/A",
        role: user.role || "customer",
        joined: user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "N/A",
      }));

      setCustomers(formatted);
      setFilteredCustomers(formatted);
      toast.success("Customers loaded!");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load customers.");
      toast.error("Failed to load customers.");
      setCustomers([]);
      setFilteredCustomers([]);
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
    fetchCustomers();
    fetchAvailableRoles();
  }, [auth.token]);

  // Search & Pagination (unchanged)
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.role.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchQuery, customers]);

  useEffect(() => {
    const newTotalPages = Math.ceil(
      filteredCustomers.length / customersPerPage
    );
    setTotalPages(newTotalPages || 1);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(1);
  }, [filteredCustomers, currentPage]);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * customersPerPage,
    currentPage * customersPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getPageNumbers = () => {
    const max = 5;
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }

      toast.success("User deleted!");
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Open Role Edit Modal
  const openRoleModal = (customer) => {
    setSelectedCustomer(customer);
    setIsRoleModalOpen(true);
  };

  // Update Role
  const handleUpdateRole = async (newRole) => {
    const payload = new FormData();
    payload.append("role", newRole);
    payload.append("_method", "PATCH");

    try {
      const res = await fetch(
        `${API_BASE}/admin/users/${selectedCustomer.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: payload,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update role");

      toast.success("Role updated successfully!");
      fetchCustomers();
      setIsRoleModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between text-[#414245] mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#141718] mb-2">
              Customers
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div> */}
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or role"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200 text-[#414245]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-[#141718]">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.role === "admin"
                              ? "bg-[#5F1327] text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.joined}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openRoleModal(customer)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Role
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#5F1327] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Edit Modal */}
      {isRoleModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
            <div className="mb-4 text-sm">
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-gray-500">{selectedCustomer.email}</p>
            </div>

            <select
              defaultValue={selectedCustomer?.role}
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
                  setSelectedCustomer(null);
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

export default Customers;
