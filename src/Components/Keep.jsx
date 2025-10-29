import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryFeeManager = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [fee, setFee] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const API_BASE = "https://api.sablle.ng/api";
  const ITEMS_PER_PAGE = 10;
  const CACHE_KEY_LOC = "delivery_locations_cache";
  const CACHE_KEY_FEES = "delivery_fees_local";
  const CACHE_TTL = 60 * 60 * 1000;

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      toast.error("Please log in to manage delivery fees.", {
        autoClose: 3000,
      });
      setTimeout(() => navigate("/admin/signin"), 2000);
    }
  }, [auth, navigate]);

  // Fetch locations with cache
  const fetchLocations = async () => {
    const cached = localStorage.getItem(CACHE_KEY_LOC);
    const now = Date.now();

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < CACHE_TTL) {
        setLocations(data.states || []);
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/locations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok && data.states) {
        setLocations(data.states);
        localStorage.setItem(
          CACHE_KEY_LOC,
          JSON.stringify({ data, timestamp: now })
        );
      } else {
        throw new Error("Failed to load locations");
      }
    } catch (err) {
      toast.error("Failed to load locations.");
      setLocations([]);
    }
  };

  // Load & save fees from localStorage
  const loadLocalFees = () => {
    const saved = localStorage.getItem(CACHE_KEY_FEES);
    return saved ? JSON.parse(saved) : [];
  };

  const saveLocalFees = (fees) => {
    localStorage.setItem(CACHE_KEY_FEES, JSON.stringify(fees));
  };

  // Main data load
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!auth.token) return;

      setLoading(true);

      try {
        await fetchLocations();
        const localFees = loadLocalFees();

        if (!isMounted) return;

        const allData = [];
        let idCounter = 1000;

        for (const state of locations) {
          for (const lga of state.lgas || []) {
            for (const place of lga.places || []) {
              const feeObj = localFees.find(
                (f) =>
                  f.state_name === state.state_name &&
                  f.lga_name === lga.lga_name &&
                  f.places === place
              );

              allData.push({
                id: feeObj?.id || `temp-${idCounter++}`,
                state: state.state_name,
                lga: lga.lga_name,
                place,
                fee: feeObj?.fee ? parseFloat(feeObj.fee) : 0,
                isTemp: !feeObj?.id,
              });
            }
          }
        }

        const filtered = allData.filter((item) =>
          [item.state, item.lga, item.place].some((field) =>
            field.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, end);

        setDeliveryData(paginated);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
      } catch (err) {
        if (isMounted) {
          toast.error("Failed to load data.");
          setDeliveryData([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchQuery, locations, auth.token]);

  // === FILTERED STATES (ONLY WITH FEES) ===
  const getStatesWithFees = () => {
    const fees = loadLocalFees();
    const stateSet = new Set(fees.map((f) => f.state_name));
    return locations.filter((state) => stateSet.has(state.state_name));
  };

  const getFilteredLgas = () => {
    if (!selectedState) return [];
    const fees = loadLocalFees();
    const lgaSet = new Set(
      fees.filter((f) => f.state_name === selectedState).map((f) => f.lga_name)
    );
    const state = locations.find((s) => s.state_name === selectedState);
    return (state?.lgas || []).filter((lga) => lgaSet.has(lga.lga_name));
  };

  const getFilteredPlaces = () => {
    if (!selectedState || !selectedLga) return [];
    const fees = loadLocalFees();
    const placeSet = new Set(
      fees
        .filter(
          (f) => f.state_name === selectedState && f.lga_name === selectedLga
        )
        .map((f) => f.places)
    );
    const state = locations.find((s) => s.state_name === selectedState);
    const lga = state?.lgas.find((l) => l.lga_name === selectedLga);
    return (lga?.places || []).filter((place) => placeSet.has(place));
  };

  // Open modal
  const openModal = (item = null) => {
    setIsModalOpen(true);
    setModalError("");
    setIsEditMode(!!item && !item.isTemp);
    setEditingId(item?.id || null);

    if (item) {
      setSelectedState(item.state);
      setSelectedLga(item.lga);
      setSelectedPlace(item.place);
      setFee(item.fee.toString());
    } else {
      setSelectedState("");
      setSelectedLga("");
      setSelectedPlace("");
      setFee("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
    setIsEditMode(false);
    setEditingId(null);
    setSelectedState("");
    setSelectedLga("");
    setSelectedPlace("");
    setFee("");
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedLga || !selectedPlace || !fee || fee <= 0) {
      setModalError("All fields are required and fee must be positive.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    const formData = new FormData();
    formData.append("state_name", selectedState);
    formData.append("lga_name", selectedLga);
    formData.append("places", selectedPlace);
    formData.append("fee", fee);

    const localFees = loadLocalFees();

    try {
      let newFeeData;

      if (isEditMode) {
        const res = await fetch(`${API_BASE}/delivery-fee/${editingId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          newFeeData = data.data;
          toast.success("Updated!");
        } else {
          throw new Error(data.message || "Update failed");
        }
      } else {
        const res = await fetch(`${API_BASE}/delivery-fee`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          newFeeData = data.data;
          toast.success("Added!");
        } else {
          throw new Error(data.message || "Add failed");
        }
      }

      if (isEditMode) {
        const index = localFees.findIndex((f) => f.id === editingId);
        if (index !== -1) localFees[index] = newFeeData;
      } else {
        localFees.push(newFeeData);
      }
      saveLocalFees(localFees);

      closeModal();
      setCurrentPage(1);
    } catch (err) {
      setModalError(err.message);
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete (instant)
  const handleDelete = async (id) => {
    if (id.toString().startsWith("temp-")) {
      setCurrentPage(1);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/delivery-fee/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (res.ok) {
        toast.success("Deleted!");
        const localFees = loadLocalFees();
        const updated = localFees.filter((f) => f.id !== id);
        saveLocalFees(updated);
        setCurrentPage(1);
      } else {
        const data = await res.json();
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const formatPrice = (amount) => `₦${Number(amount).toLocaleString()}`;

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#141718] mb-2">
              Delivery Fee Manager
            </h1>
            <p className="text-[#6C7275]">Manage delivery fees by location.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Fee
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search state, LGA, or place..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200 text-[#414245]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    LGA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Place
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : deliveryData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No results found."
                        : "No delivery fees set."}
                    </td>
                  </tr>
                ) : (
                  deliveryData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.lga}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.place}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#5F1327]">
                        {formatPrice(item.fee)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {item.fee > 0 && (
                            <>
                              <button
                                onClick={() => openModal(item)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {item.fee === 0 && (
                            <span className="text-xs text-gray-400">
                              No fee set
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
        </div>
      </div>

      {/* MODAL WITH FILTERED DROPDOWNS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Update" : "Add"} Delivery Fee
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedLga("");
                    setSelectedPlace("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                >
                  <option value="">Select State (with fee)</option>
                  {getStatesWithFees().map((s) => (
                    <option key={s.state_name} value={s.state_name}>
                      {s.state_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LGA
                </label>
                <select
                  value={selectedLga}
                  onChange={(e) => {
                    setSelectedLga(e.target.value);
                    setSelectedPlace("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                  disabled={!selectedState}
                >
                  <option value="">Select LGA (with fee)</option>
                  {getFilteredLgas().map((lga) => (
                    <option key={lga.lga_name} value={lga.lga_name}>
                      {lga.lga_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place
                </label>
                <select
                  value={selectedPlace}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                  disabled={!selectedLga}
                >
                  <option value="">Select Place (with fee)</option>
                  {getFilteredPlaces().map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee (₦)
                </label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. 2500"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 bg-[#5F1327] text-white py-2 rounded-lg font-medium hover:bg-[#B54F5E] disabled:opacity-50"
                >
                  {modalLoading ? "Saving..." : isEditMode ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFeeManager;
