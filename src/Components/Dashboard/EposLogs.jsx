import React, { useState, useEffect, useContext } from "react";
import { Search, Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.sablle.ng/api";

const EposLogs = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states from Laravel response
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(20);

  // Auth Guard
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      toast.error("Please log in to view Epos logs.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/signin"), 2000);
    }
  }, [auth, navigate]);

  // Fetch Logs
  const fetchLogs = async (page = 1) => {
    if (!auth.token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/eposnow/logs?page=${page}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load Epos logs");
      }

      const formatted = (result.data || []).map((log) => ({
        id: log.id,
        syncType: log.sync_type || "unknown",
        status: log.status || "unknown",
        productName: log.product?.name || "Unknown Product",
        quantity: log.quantity ?? "-",
        oldStock: log.old_stock ?? "-",
        newStock: log.new_stock ?? "-",
        paymentMethod: log.payment_method || "-",
        syncedAt: log.synced_at
          ? new Date(log.synced_at).toLocaleString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        response: log.response,
      }));

      setLogs(formatted);
      setFilteredLogs(formatted);

      // Update pagination info
      setCurrentPage(result.current_page || 1);
      setTotalPages(result.last_page || 1);
      setTotalItems(result.total || 0);
      setPerPage(result.per_page || 20);

      if (formatted.length > 0) {
        toast.success("Epos logs loaded!");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load Epos logs.");
      toast.error("Failed to load Epos logs.");
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [auth.token, currentPage]);

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.productName.toLowerCase().includes(query) ||
        log.syncType.toLowerCase().includes(query) ||
        log.status.toLowerCase().includes(query) ||
        log.paymentMethod.toLowerCase().includes(query)
    );
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, logs]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

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
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between text-[#414245] mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#141718] mb-2">
              EposNow Sync Logs
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
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, sync type, status, or payment method"
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
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Sync Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Stock Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Synced At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      Loading logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No sync logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-[#141718]">
                        {log.productName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {log.syncType.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === "success"
                              ? "bg-green-100 text-green-800"
                              : log.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">
                        {log.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.oldStock} →{" "}
                        <span className="font-medium">{log.newStock}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.syncedAt}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/epos-logs/${log.id}`)
                          }
                          className="text-sm text-[#0B36B5] hover:text-blue-800 font-medium"
                        >
                          Details
                        </button>
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
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalItems)} of {totalItems}{" "}
                logs
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
    </div>
  );
};

export default EposLogs;
