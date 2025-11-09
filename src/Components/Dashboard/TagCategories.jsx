import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";

const TagCategories = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams(); // Tag ID
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [tagName, setTagName] = useState("");

  const fetchTagCategories = async (page = 1, search = "") => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.sablle.ng/api/tags/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      let allCategories = Array.isArray(data.categories) ? data.categories : [];

      // Filter by search
      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        allCategories = allCategories.filter((cat) =>
          cat.name?.toLowerCase().includes(lowerSearch)
        );
      }

      // Pagination
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedCategories = allCategories.slice(start, end);

      setCategories(paginatedCategories);
      setTotalPages(Math.ceil(allCategories.length / itemsPerPage) || 1);
      setTagName(data.name || "Tag");
      toast.success(`Loaded ${allCategories.length} categories`, {
        autoClose: 2000,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagCategories(1, searchQuery);
  }, [id, auth.token, navigate]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchTagCategories(1, searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTagCategories(page, searchQuery);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-red-600 text-center py-12">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/tags")}
          className="flex items-center gap-2 text-[#5F1327] hover:bg-[#B54F5E]/10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tags
        </button>
        <h1 className="text-2xl font-semibold text-[#141718]">
          Categories in "{tagName}"
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-gray-200 text-[#414245]">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={2} className="px-6 py-4">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "No categories match your search."
                      : "No categories under this tag."}
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          cat.is_active
                            ? "bg-[#EAFFD8] text-[#1B8401]"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(
                  1,
                  Math.min(totalPages, currentPage - 2 + i)
                );
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#5F1327] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4 transform rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagCategories;
