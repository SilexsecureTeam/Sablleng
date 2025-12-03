import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  ChevronDown,
  Download,
  AlertCircle,
  Plus,
  Eye,
  Trash2,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import StockInventoryReportForm from "./StockInventoryReportForm";
import Can from "./Can"

const Report = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Add this useEffect — it will "fix" any missing names using the IDs
// FIX: Properly copy names from newly added items to old ones
useEffect(() => {
  if (data.length === 0) return;

  // Find any items that HAVE the names (these are the ones we just added)
  const itemsWithNames = data.filter(item => 
    item.category_name && item.brand_name && item.supplier_name
  );

  if (itemsWithNames.length === 0) return;

  setData(prevData =>
    prevData.map(item => {
      // If item already has names, leave it
      if (item.category_name && item.brand_name && item.supplier_name) {
        return item;
      }

      // Find a matching item (by ID) that has the correct names
      const match = itemsWithNames.find(x => x.id === item.id);
      if (match) {
        return {
          ...item,
          category_name: match.category_name,
          brand_name: match.brand_name,
          supplier_name: match.supplier_name,
        };
      }

      return item; // no match found, leave as-is
    })
  );
}, [data]);
  const PRODUCTS_PER_PAGE = 15;

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchInventory = async () => {
      if (!auth.token) {
        toast.error("Please verify OTP to continue.", { autoClose: 3000 });
        setTimeout(() => navigate("/admin/otp"), 2000);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          "https://api.sablle.ng/api/stockInventory",
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

        const result = await response.json();
        const items = result.data || [];
        setData(items);
      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`, { autoClose: 5000 });
        if (err.message.includes("Unauthorized")) {
          setTimeout(() => navigate("/admin/signin"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [auth.token, navigate]);

  // Search + Filter
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  useEffect(() => {
    const pages = Math.ceil(filteredData.length / PRODUCTS_PER_PAGE) || 1;
    setTotalPages(pages);
    if (currentPage > pages && pages > 0) setCurrentPage(1);
  }, [filteredData, currentPage]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const totalValue = filteredData
    .reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0)
    .toFixed(2);
  const totalItemsInStock = filteredData.reduce(
    (sum, item) => sum + (item.current_stock || 0),
    0
  );
  const avgMarginPercent =
    filteredData.length > 0
      ? (
          (filteredData.reduce(
            (sum, item) => sum + parseFloat(item.margin_percentage || 0),
            0
          ) /
            filteredData.length) *
          100
        ).toFixed(1)
      : 0;
  const lowStockItems = filteredData.filter(
    (item) => (item.current_stock || 0) < 5
  ).length;

  const categoryData = filteredData.reduce((acc, item) => {
    const cat = item.category_name || "Uncategorized";
    const value = parseFloat(item.total_value || 0);
    acc[cat] = (acc[cat] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const exportCSV = () => {
    const headers = [
      "Name",
      "Barcode",
      "Brand",
      "Category",
      "Current Stock",
      "Total Stock",
      "Cost Price",
      "Sales Price",
      "Total Value",
      "Margin %",
    ];
    const rows = filteredData.map((item) => [
      `"${item.name}"`,
      item.barcode,
      item.brand,
      item.category_name,
      item.current_stock,
      item.total_stock,
      item.cost_price,
      item.sales_price,
      item.total_value,
      (parseFloat(item.margin_percentage) * 100).toFixed(1) + "%",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-inventory-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      const response = await fetch(
        `https://api.sablle.ng/api/stockInventory/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (!response.ok) throw new Error("Delete failed");
      toast.success("Item deleted!");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );

  return (
    <Can perform='stocks.view'>
    <div className="min-h-screen bg-[#FAF7F5] p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex w-full justify-between mb-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#141718]">
            Stock Inventory Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time overview of inventory value and stock levels for{" "}
            <strong>{currentMonth}</strong>
          </p>
        </div>
        <Can perdorm="stocks.create">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#5F1327] h-fit hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stock Inventory
        </button>
        </Can>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600">Total Inventory Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ₦{parseFloat(totalValue).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600">Items in Stock</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalItemsInStock.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600">Avg Margin</div>
            <div className="text-2xl font-bold text-green-600">
              {avgMarginPercent}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 flex items-center gap-1">
              Low Stock <span className="text-xs text-red-500">{"<5"}</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {lowStockItems}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 md:p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Value by Category
            </h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-sm font-medium text-gray-700">
                {currentMonth}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="h-64 md:h-80 min-h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 40, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#5F1327" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No category data
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={exportCSV}
            className="bg-[#5F1327] hover:bg-[#B54F5E] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4  bg-white py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F1327] focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Margin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.barcode}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.category_name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-medium ${
                          item.current_stock < 5
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {item.current_stock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        / {item.total_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₦
                      {(parseFloat(item.total_value) || 0).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-green-600 font-medium">
                        {(parseFloat(item.margin_percentage) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Can perform="stocks.update">
                        <Link
                          to={`/dashboard/report/${item.id}`}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        </Can>
                        <Can perform="stocks.delete">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
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
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

        <div className="mt-6 text-center text-xs text-gray-500">
          Last updated:{" "}
          {new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
        </div>
      </div>

     {isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <StockInventoryReportForm
        onSave={(newItem) => {
          setData((oldItems) => [newItem, ...oldItems]);
          setIsModalOpen(false);
          toast.success("Item added successfully!");
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  </div>
)}
    </div>
    </Can >
  );
};

export default Report;
