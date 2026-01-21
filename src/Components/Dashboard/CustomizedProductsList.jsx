import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Image as ImageIcon } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject"; // adjust path if needed
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomizedProductsList = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomizedProducts = async () => {
    if (!auth?.token) {
      toast.error("Session expired. Please log in again.");
      navigate("/admin/signin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://api.sablle.ng/api/product/customized", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized. Redirecting...");
          setTimeout(() => navigate("/admin/signin"), 1500);
          return;
        }
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();

      // Only keep products that actually have customizations
      const withCustoms = (data.products || []).filter(
        (p) => p.customization && p.customization.length > 0
      );

      // Format for display
      const formatted = withCustoms.map((p) => ({
        id: p.id,
        name: p.name || "Unnamed Product",
        category: p.category || "N/A",
        customizeCount: p.customization?.length || 0,
        lastCustomized: p.customization?.length
          ? p.customization[p.customization.length - 1].created_at
          : null,
        previewImage: p.customization?.[0]?.image_path
          ? `https://api.sablle.ng/storage/${p.customization[0].image_path}`
          : null,
      }));

      setProducts(formatted);
      setFilteredProducts(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(`Could not load customizations: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomizedProducts();
  }, [auth?.token]);

  // Live search filter
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleViewDetails = (productId) => {
    navigate(`/dashboard/customizations/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading customized products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchCustomizedProducts}
          className="mt-4 px-4 py-2 bg-[#5F1327] text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b">
            <h1 className="text-2xl font-semibold text-[#141718]">
              Customized Products
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredProducts.length} products with customer customizations
            </p>
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No customized products found yet.
              {products.length === 0 && " (No data from API)"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b bg-gray-50 text-[#414245] text-xs uppercase font-medium">
                    <th className="px-6 py-3 text-left">Preview</th>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-center">Customizations</th>
                    <th className="px-6 py-3 text-left">Last</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {p.previewImage ? (
                          <img
                            src={p.previewImage}
                            alt="Custom preview"
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#141718]">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.category}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {p.customizeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.lastCustomized
                          ? new Date(p.lastCustomized).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(p.id)}
                          className="px-3 py-1.5 bg-[#5F1327] hover:bg-[#B54F5E] text-white text-sm rounded-md transition-colors"
                        >
                          View Customizations
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomizedProductsList;