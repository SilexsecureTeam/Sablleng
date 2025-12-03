// SupplierList.jsx
import React, { useState, useEffect, useContext } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SupplierForm from "./SupplierForm";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Can from "./Can";

const SupplierList = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSuppliers = async (page = 1) => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.sablle.ng/api/suppliers?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      const suppliersArray = Array.isArray(data) ? data : data.suppliers || [];

      const formatted = suppliersArray.map((s) => ({
        id: s.id,
        name: s.name || "N/A",
        email: s.email || "N/A",
        phone: s.phone || "N/A",
        isActive: s.is_active === 1,
        createdAt: s.created_at,
      }));

      setSuppliers(formatted);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [currentPage, auth.token]);

  const handleDelete = async (id, index) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/suppliers/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Supplier deleted!");
      setSuppliers((prev) => prev.filter((_, i) => i !== index));
      fetchSuppliers(currentPage);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleSaveSupplier = (newSupplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
    setIsModalOpen(false);
    toast.success("Supplier added!");
    setCurrentPage(1);
    fetchSuppliers(1);
  };

  const filtered = suppliers.filter((s) =>
    [s.name, s.email, s.phone].some((f) =>
      f?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getPageNumbers = () => {
    const max = 5;
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <Can perform="suppliers.view">
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex w-full justify-end mb-6">
          <Can perform="suppliers.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </Can>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-2xl font-semibold text-[#141718]">
                Suppliers Inventory
              </h1>
            </div>

            <div className="px-6 pb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Suppliers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">Loading suppliers...</p>
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : (
              <>
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtered.map((s, i) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#414245]">
                            {s.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                            {s.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                            {s.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                s.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {s.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                            {new Date(s.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Can perform="suppliers.edit">
                                <Link
                                  to={`/dashboard/suppliers/${s.id}/edit`}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-[#5F1327] hover:bg-gray-200 transition-colors"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Link>
                              </Can>
                              <Can perform="suppliers.delete">
                                <button
                                  onClick={() => handleDelete(s.id, i)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </Can>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">No suppliers found.</p>
                  </div>
                )}

                {suppliers.length > 0 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>
                      {getPageNumbers().map((p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            currentPage === p
                              ? "bg-[#5F1327] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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
              </>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <SupplierForm
                onSave={handleSaveSupplier}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Can>
  );
};

export default SupplierList;
