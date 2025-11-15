import React, { useState, useEffect, useContext } from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Report = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // === FETCH INVENTORY ===
  const fetchInventory = async () => {
    if (!auth.token) {
      toast.error("Please verify OTP to continue.", { autoClose: 3000 });
      setTimeout(() => navigate("/admin/otp"), 2000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.sablle.ng/api/stockInventory`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.status === 401) throw new Error("Unauthorized.");
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const result = await response.json();
      const data = result.data || [];

      const formatted = data.map((item) => ({
        id: item.id,
        name: item.name || "N/A",
        barcode: item.barcode || "N/A",
        brand: item.brand || "N/A",
        supplier: item.supplier || "N/A",
        orderCode: item.order_code || "N/A",
        category: item.category_name || "N/A",
        currentStock: item.current_stock ?? 0,
        totalStock: item.total_stock ?? 0,
        onOrder: item.on_order ?? 0,
        costPrice: `₦${parseFloat(item.cost_price || 0).toLocaleString()}`,
        salesPrice: `₦${parseFloat(item.sales_price || 0).toLocaleString()}`,
      }));

      setInventory(formatted);
      setTotalPages(1);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
      setInventory([]);
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => navigate("/admin/signin"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [auth.token]);

  // === FILTER & PAGINATION ===
  const filteredItems = inventory.filter((item) =>
    [
      item.name,
      item.barcode,
      item.brand,
      item.supplier,
      item.orderCode,
      item.category,
    ].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    setTotalPages(newTotalPages || 1);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredItems, currentPage]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // === CRUD HANDLERS ===
  const handleEdit = (index) => {
    setSelectedItem(paginatedItems[index]);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/reports/inventory/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }

      toast.success("Item deleted!", { autoClose: 3000 });
      fetchInventory();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  const handleSave = async (formData) => {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/reports/inventory`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: data,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }

      toast.success("Item added!", { autoClose: 3000 });
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  const handleUpdate = async (formData) => {
    const data = new FormData();
    for (const key in formData) {
      if (key !== "id") data.append(key, formData[key]);
    }
    data.append("_method", "PATCH");

    try {
      const response = await fetch(
        `https://api.sablle.ng/api/reports/inventory/${formData.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: data,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      toast.success("Item updated!", { autoClose: 3000 });
      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchInventory();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { autoClose: 5000 });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const getPageNumbers = () => {
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex w-full justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-semibold text-[#141718]">
              Inventory Report
            </h1>
          </div>

          <div className="px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Inventory"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">Loading inventory...</p>
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
                        Barcode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Order Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Sales Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-[#414245] max-w-[180px] truncate">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.barcode}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.brand}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.supplier}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.orderCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245] text-center">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.costPrice}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414245]">
                          {item.salesPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-[#5F1327] hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paginatedItems.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No items found.</p>
                </div>
              )}

              {filteredItems.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border rounded-md text-sm font-medium flex items-center gap-1 ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
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
                      className={`px-4 py-2 border rounded-md text-sm font-medium flex items-center gap-1 ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* === ADD MODAL === */}
      {isModalOpen && (
        <InventoryForm onSave={handleSave} onCancel={handleCloseModal} />
      )}

      {/* === EDIT MODAL === */}
      {isEditModalOpen && selectedItem && (
        <InventoryForm
          item={selectedItem}
          onSave={handleUpdate}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

// === REUSABLE FORM COMPONENT ===
const InventoryForm = ({ item, onSave, onCancel }) => {
  const [form, setForm] = useState(
    item
      ? {
          id: item.id,
          name: item.name,
          barcode: item.barcode,
          brand: item.brand,
          supplier: item.supplier,
          order_code: item.orderCode,
          category_name: item.category,
          current_stock: item.currentStock,
          cost_price: item.costPrice.replace(/₦|,/g, ""),
          sales_price: item.salesPrice.replace(/₦|,/g, ""),
        }
      : {
          name: "",
          barcode: "",
          brand: "",
          supplier: "",
          order_code: "",
          category_name: "",
          current_stock: "",
          cost_price: "",
          sales_price: "",
        }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-[#141718] mb-4">
          {item ? "Edit Inventory Item" : "Add New Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Name", name: "name" },
            { label: "Barcode", name: "barcode" },
            { label: "Brand", name: "brand" },
            { label: "Supplier", name: "supplier" },
            { label: "Order Code", name: "order_code" },
            { label: "Category", name: "category_name" },
            { label: "Current Stock", name: "current_stock", type: "number" },
            { label: "Cost Price", name: "cost_price", type: "number" },
            { label: "Sales Price", name: "sales_price", type: "number" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[#414245] mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white rounded-md text-sm font-medium transition-colors"
            >
              {item ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;
