import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Clock, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthContextObject";

const API_BASE = "https://api.sablle.ng/api";

const EposLogDetails = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogDetails = async () => {
    if (!auth.token) {
      toast.error("Authentication required.");
      navigate("/admin/signin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/eposnow/logs/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to load log details");

      const l = data.log || data; // adjust based on actual response structure

      const formatted = {
        id: l.id,
        syncType: l.sync_type || "Unknown",
        status: l.status || "unknown",
        productName: l.product?.name || "Unknown Product",
        productId: l.product?.id,
        quantity: l.quantity ?? "-",
        oldStock: l.old_stock ?? "-",
        newStock: l.new_stock ?? "-",
        paymentMethod: l.payment_method || "-",
        syncedAt: l.synced_at
          ? new Date(l.synced_at).toLocaleString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "N/A",
        response: l.response,
      };

      setLog(formatted);
      toast.success("Log details loaded!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLogDetails();
  }, [id, auth.token]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#5F1327] hover:bg-[#B54F5E]/10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-[#141718]">
            EposNow Sync Log Details #{id}
          </h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F1327] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading log details...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchLogDetails}
              className="mt-4 px-6 py-2 bg-[#5F1327] text-white rounded-md hover:bg-[#4A0F1F]"
            >
              Retry
            </button>
          </div>
        ) : log ? (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Status & Sync Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sync Type</p>
                <p className="font-medium text-[#141718] capitalize">
                  {log.syncType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    log.status === "success"
                      ? "bg-green-100 text-green-800"
                      : log.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {log.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{log.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-medium text-gray-600">
                    {log.productId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Stock Update</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Quantity Synced</p>
                  <p className="text-2xl font-bold text-[#5F1327]">
                    {log.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Old Stock</p>
                  <p className="text-2xl font-bold">{log.oldStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">New Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {log.newStock}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Synced At
                </p>
                <p className="font-medium">{log.syncedAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium capitalize">{log.paymentMethod}</p>
              </div>
            </div>

            {/* Response (if failed) */}
            {log.response && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  API Response (Error Details)
                </h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {typeof log.response === "object"
                    ? JSON.stringify(log.response, null, 2)
                    : log.response}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Log not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EposLogDetails;
