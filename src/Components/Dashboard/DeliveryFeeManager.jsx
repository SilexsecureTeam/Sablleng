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
  const [error, setError] = useState("");

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

  // Redirect if not logged in
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      toast.error("Please log in to manage delivery fees.", {
        autoClose: 3000,
      });
      setTimeout(() => navigate("/admin/signin"), 2000);
    }
  }, [auth, navigate]);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok && data.states) {
        setLocations(data.states);
      } else {
        throw new Error(data.message || "Failed to load locations");
      }
    } catch (err) {
      toast.error("Failed to load locations.");
    }
  };

  // FETCH DATA FUNCTION
  const fetchData = async () => {
    if (!auth.token) return;

    setLoading(true);
    setError("");

    try {
      const statesRes = await fetch(`${API_BASE}/states`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const states = await statesRes.json();

      if (!statesRes.ok || !Array.isArray(states))
        throw new Error("Failed to load states");

      let allPlaces = [];
      let index = 0;

      for (const state of states) {
        const stateName = state.state_name;
        const lgasRes = await fetch(
          `${API_BASE}/lgas/${encodeURIComponent(stateName)}`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        const lgas = await lgasRes.json();

        if (lgasRes.ok && Array.isArray(lgas)) {
          for (const lga of lgas) {
            const lgaName = lga.lga_name;
            const placesRes = await fetch(
              `${API_BASE}/places/${encodeURIComponent(
                stateName
              )}/${encodeURIComponent(lgaName)}`,
              { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            const places = await placesRes.json();

            if (placesRes.ok && Array.isArray(places)) {
              const formatted = places.map((p) => ({
                id: p.id || ++index,
                state: stateName,
                lga: lgaName,
                place: p.places,
                fee: parseFloat(p.fee) || 0,
              }));
              allPlaces.push(...formatted);
            }
          }
        }
      }

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginated = allPlaces.slice(start, end);

      setDeliveryData(paginated);
      setTotalPages(Math.ceil(allPlaces.length / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      setError("Failed to load delivery fees.");
      toast.error("Failed to load delivery fees.");
      setDeliveryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on page change
  useEffect(() => {
    fetchData();
  }, [currentPage, auth.token]);

  // Open modal
  const openModal = (item = null) => {
    setIsModalOpen(true);
    setModalError("");
    setIsEditMode(!!item);
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
    fetchLocations();
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

  const getLgas = () => {
    const state = locations.find((s) => s.state_name === selectedState);
    return state?.lgas || [];
  };

  const getPlaces = () => {
    const lgas = getLgas();
    const lga = lgas.find((l) => l.lga_name === selectedLga);
    return lga?.places || [];
  };

  // ADD / UPDATE → REFRESH DATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedLga || !selectedPlace || !fee || fee <= 0) {
      setModalError("All fields are required and fee must be positive.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    const url = isEditMode
      ? `${API_BASE}/delivery-fee/${editingId}`
      : `${API_BASE}/delivery-fee`;

    try {
      const formData = new FormData();
      formData.append("state_name", selectedState);
      formData.append("lga_name", selectedLga);
      formData.append("places", selectedPlace);
      formData.append("fee", fee);

      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isEditMode ? "Updated!" : "Added!");
        closeModal();
        setCurrentPage(1);
        await fetchData(); // ← FORCE REFRESH
      } else {
        setModalError(data.message || "Operation failed.");
        toast.error(data.message || "Operation failed.");
      }
    } catch (err) {
      setModalError("Network error.");
      toast.error("Network error.");
    } finally {
      setModalLoading(false);
    }
  };

  // DELETE → REFRESH DATA
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delivery-fee/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (res.ok) {
        toast.success("Deleted!");
        setCurrentPage(1);
        await fetchData(); // ← FORCE REFRESH
      } else {
        const data = await res.json();
        toast.error(data.message || "Delete failed.");
      }
    } catch (err) {
      toast.error("Network error.");
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
            <p className="text-[#6C7275]">
              View, add, update, and delete delivery fees.
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Delivery Fee
          </button>
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
                    Place/City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Delivery Fee
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
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : deliveryData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No delivery fees set.
                    </td>
                  </tr>
                ) : (
                  deliveryData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.lga}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.place}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#5F1327]">
                        {formatPrice(item.fee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
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

      {/* MODAL */}
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
                  <option value="">Select State</option>
                  {locations.map((s) => (
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
                  <option value="">Select LGA</option>
                  {getLgas().map((lga) => (
                    <option key={lga.lga_name} value={lga.lga_name}>
                      {lga.lga_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place/City
                </label>
                <select
                  value={selectedPlace}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F1327]"
                  required
                  disabled={!selectedLga}
                >
                  <option value="">Select Place</option>
                  {getPlaces().map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee (₦)
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
