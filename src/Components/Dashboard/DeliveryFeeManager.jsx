// src/components/DeliveryFeeManager.jsx
import React, { useContext, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../../context/AuthContextObject";

const API_LOC = "https://api.sablle.ng/api/locations";
const API_FEE = "https://sablle_api.test/api/delivery-fee";

export default function DeliveryFeeManager() {
  const { auth } = useContext(AuthContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Location data
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [places, setPlaces] = useState([]);

  // Selected values
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [fee, setFee] = useState("");

  // -------------------------------------------------
  // 1. Load states from locations API
  // -------------------------------------------------
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const load = async () => {
      setLoadingLoc(true);
      try {
        const res = await fetch(API_LOC);
        if (!res.ok) throw new Error("Failed to load locations");
        const data = await res.json();
        const stateNames = (data.states || []).map((s) => s.state_name);
        setStates(stateNames);
      } catch (err) {
        toast.error(err.message || "Failed to load states");
      } finally {
        setLoadingLoc(false);
      }
    };
    load();
  }, [auth.isAuthenticated]);

  // -------------------------------------------------
  // 2. When state changes → load LGAs
  // -------------------------------------------------
  useEffect(() => {
    if (!selectedState) {
      setLgas([]);
      setSelectedLga("");
      return;
    }

    const loadLgas = async () => {
      const res = await fetch(API_LOC);
      const data = await res.json();
      const stateObj = (data.states || []).find(
        (s) => s.state_name === selectedState
      );
      setLgas(stateObj?.lgas || []);
      setSelectedLga("");
    };
    loadLgas();
  }, [selectedState]);

  // -------------------------------------------------
  // 3. When LGA changes → load places
  // -------------------------------------------------
  useEffect(() => {
    if (!selectedLga) {
      setPlaces([]);
      setSelectedPlace("");
      return;
    }
    const lgaObj = lgas.find((l) => l.lga_name === selectedLga);
    setPlaces(lgaObj?.places || []);
  }, [selectedLga, lgas]);

  // -------------------------------------------------
  // 4. Submit new fee
  // -------------------------------------------------
  const handleSubmit = async () => {
    if (!selectedState || !selectedLga || !selectedPlace || !fee) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("state_name", selectedState);
      fd.append("lga_name", selectedLga);
      fd.append("places", selectedPlace);
      fd.append("fee", fee);

      const res = await fetch(API_FEE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save fee");
      }

      toast.success("Delivery fee saved successfully!");
      closeModal();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------
  // Modal controls
  // -------------------------------------------------
  const openModal = () => {
    setSelectedState("");
    setSelectedLga("");
    setSelectedPlace("");
    setFee("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Login Required</h2>
          <p className="text-gray-600">Please log in to add delivery fees.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add Delivery Fee
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Delivery Fee Manager
        </h1>
        <p className="text-sm text-gray-600">
          Click the button above to add a new delivery fee for any location.
        </p>
      </div>

      {/* ──────── MODAL ──────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add Delivery Fee</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* STATE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={loadingLoc}
                >
                  <option value="">
                    {loadingLoc ? "Loading states..." : "Select State"}
                  </option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* LGA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LGA
                </label>
                <select
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={!selectedState}
                >
                  <option value="">
                    {selectedState ? "Select LGA" : "First select state"}
                  </option>
                  {lgas.map((l) => (
                    <option key={l.lga_name} value={l.lga_name}>
                      {l.lga_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PLACE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place / City
                </label>
                <select
                  value={selectedPlace}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={!selectedLga}
                >
                  <option value="">
                    {selectedLga ? "Select Place" : "First select LGA"}
                  </option>
                  {places.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* FEE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  placeholder="e.g. 900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#5F1327] text-white rounded-lg text-sm font-medium hover:bg-[#B54F5E] disabled:opacity-70"
                >
                  {submitting ? "Saving..." : "Save Fee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
