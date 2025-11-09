import React, { useState, useEffect, useContext } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BrandForm from "./BrandForm";
import EditBrandForm from "./EditBrandForm";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BrandList = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBrands = async (page = 1) => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.sablle.ng/api/brand?page=${page}`,
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
      const brandsArray = data.brands || [];

      const formattedBrands = brandsArray.map((item) => ({
        id: item.id || 0,
        name: item.name || "N/A",
        description: item.description || "N/A",
        logo: item.logo || null,
        isActive: item.is_active || false,
        createdAt: item.created_at || "N/A",
      }));

      setBrands(formattedBrands);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setBrands([]);
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => navigate("/admin/signin"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(currentPage);
  }, [currentPage, auth.token]);

  const handleEdit = (index) => {
    setSelectedBrand(brands[index]);
    setSelectedBrandIndex(index);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (brandId, index) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/brand/${brandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete brand");
      }

      toast.success("Brand deleted!", { autoClose: 3000 });
      setBrands((prev) => prev.filter((_, i) => i !== index));
      fetchBrands(currentPage);
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  const handleNewBrand = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedBrand(null);
    setSelectedBrandIndex(null);
  };

  const handleSaveBrand = (newBrand) => {
    setBrands((prev) => [newBrand, ...prev]);
    setIsModalOpen(false);
    toast.success("Brand added!", { autoClose: 3000 });
    setCurrentPage(1);
    fetchBrands(1);
  };

  const handleUpdateBrand = (updatedBrand, index) => {
    setBrands((prev) =>
      prev.map((item, i) => (i === index ? updatedBrand : item))
    );
    setIsEditModalOpen(false);
    setSelectedBrand(null);
    setSelectedBrandIndex(null);
    toast.success("Brand updated!", { autoClose: 3000 });
    fetchBrands(currentPage);
  };

  const filteredBrands = brands.filter((brand) =>
    [brand.name, brand.description].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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

      <div className="flex w-full justify-end mb-6">
        <button
          onClick={handleNewBrand}
          className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-semibold text-[#141718]">
              Brands Inventory
            </h1>
          </div>

          <div className="px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Brands"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">Loading brands...</p>
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
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBrands.map((brand, index) => (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-400">
                                No logo
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#414245]">
                          {brand.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245] max-w-xs">
                          <p className="line-clamp-2 break-words">
                            {brand.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              brand.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {brand.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#414245]">
                          {new Date(brand.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-[#5F1327] hover:bg-gray-200 transition-colors"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(brand.id, index)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBrands.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No brands found.</p>
                </div>
              )}

              {brands.length > 0 && (
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
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BrandForm onSave={handleSaveBrand} onCancel={handleCloseModal} />
          </div>
        </div>
      )}

      {isEditModalOpen && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditBrandForm
              brand={selectedBrand}
              index={selectedBrandIndex}
              onSave={handleUpdateBrand}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandList;
