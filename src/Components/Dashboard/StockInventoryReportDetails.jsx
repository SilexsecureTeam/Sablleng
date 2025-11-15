import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextObject";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { ArrowLeft } from "lucide-react";

const StockInventoryReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState({
    cat: false,
    brand: false,
    supp: false,
    item: false,
  });

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      "&:hover": { borderColor: "#9ca3af" },
      "&:focus-within": {
        borderColor: "#5F1327",
        boxShadow: "0 0 0 1px #5F1327",
      },
    }),
  };

  useEffect(() => {
    const fetchItem = async () => {
      setLoading((prev) => ({ ...prev, item: true }));
      try {
        const res = await fetch(
          `https://api.sablle.ng/api/stockInventory/${id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        if (!res.ok) throw new Error("Item not found");
        const data = await res.json();
        const record = data.data || data;

        setItem(record);
        setFormData({
          name: record.name || "",
          barcode: record.barcode || "",
          order_code: record.order_code || "",
          current_stock: record.current_stock || "",
          cost_price: record.cost_price || "",
          sales_price: record.sales_price || "",
          category_id: record.category_id || "",
          brand_id: record.brand_id || "",
          supplier_id: record.supplier_id || "",
        });
      } catch (err) {
        toast.error("Failed to load item");
        navigate("/dashboard/report");
        console.log(err);
      } finally {
        setLoading((prev) => ({ ...prev, item: false }));
      }
    };

    const fetchCategories = async () => {
      setLoading((prev) => ({ ...prev, cat: true }));
      try {
        const res = await fetch("https://api.sablle.ng/api/categories", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const active = (Array.isArray(data) ? data : [])
          .filter((c) => c.is_active === 1)
          .map((c) => ({ value: c.id, label: c.name }));
        setCategories(active);
      } catch (err) {
        toast.error("Categories failed");
        console.log(err);
      } finally {
        setLoading((prev) => ({ ...prev, cat: false }));
      }
    };

    const fetchBrands = async () => {
      setLoading((prev) => ({ ...prev, brand: true }));
      try {
        const res = await fetch("https://api.sablle.ng/api/brand", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const active = (data.brands || [])
          .filter((b) => b.is_active)
          .map((b) => ({ value: b.id, label: b.name }));
        setBrands(active);
      } catch (err) {
        toast.error("Brands failed");
        console.log(err);
      } finally {
        setLoading((prev) => ({ ...prev, brand: false }));
      }
    };

    const fetchSuppliers = async () => {
      setLoading((prev) => ({ ...prev, supp: true }));
      try {
        const res = await fetch("https://api.sablle.ng/api/suppliers", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const active = (data || [])
          .filter((s) => s.is_active === 1)
          .map((s) => ({ value: s.id, label: s.name }));
        setSuppliers(active);
      } catch (err) {
        toast.error("Suppliers failed");
        console.log(err);
      } finally {
        setLoading((prev) => ({ ...prev, supp: false }));
      }
    };

    if (auth?.token) {
      fetchItem();
      Promise.all([fetchCategories(), fetchBrands(), fetchSuppliers()]);
    }
  }, [id, auth.token, navigate]);

  const validateBarcode = (barcode) => /^\d{13}$/.test(barcode.trim());

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateBarcode(formData.barcode)) {
      toast.error("Barcode must be exactly 13 digits", { autoClose: 5000 });
      return;
    }

    const data = new FormData();
    data.append("_method", "PATCH");
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));

    try {
      const res = await fetch(
        `https://api.sablle.ng/api/stockInventory/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
          body: data,
        }
      );

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch {}

      if (!res.ok) {
        const errMsg = json?.error || json?.message || "Update failed";
        if (errMsg.toLowerCase().includes("barcode")) {
          toast.error("This barcode is already taken.", { autoClose: 5000 });
        } else {
          toast.error(errMsg);
        }
        return;
      }

      toast.success("Inventory updated successfully!", { autoClose: 3000 });
      setIsEditing(false);
      const updated = json || {};
      const record = updated.data || updated;
      setItem(record);
      setFormData({
        name: record.name || "",
        barcode: record.barcode || "",
        order_code: record.order_code || "",
        current_stock: record.current_stock || "",
        cost_price: record.cost_price || "",
        sales_price: record.sales_price || "",
        category_id: record.category_id || "",
        brand_id: record.brand_id || "",
        supplier_id: record.supplier_id || "",
      });
    } catch (err) {
      toast.error("Update failed. Check console.");
      console.log(err);
    }
  };

  if (loading.item) return <div className="p-6 text-center">Loading...</div>;
  if (!item) return <div className="p-6 text-center">Item not found</div>;

  const formatValue = (key, value) => {
    if (value == null) return "—";
    if (key.includes("price") || key.includes("value") || key.includes("cost"))
      return `₦${parseFloat(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`;
    if (key.includes("percentage")) return `${parseFloat(value).toFixed(1)}%`;
    return value;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5F1327] hover:text-[#B54F5E] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Item Details</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#5F1327] hover:bg-[#B54F5E] text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Editable Fields */}
              {[
                "name",
                "barcode",
                "order_code",
                "current_stock",
                "cost_price",
                "sales_price",
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  {field === "barcode" ? (
                    <>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 13);
                          setFormData({ ...formData, [field]: val });
                        }}
                        maxLength={13}
                        className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327] font-mono"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData[field].length}/13
                      </p>
                    </>
                  ) : (
                    <input
                      type={
                        field.includes("price") || field.includes("stock")
                          ? "number"
                          : "text"
                      }
                      step={field.includes("price") ? "0.01" : undefined}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                      required={[
                        "name",
                        "current_stock",
                        "cost_price",
                        "sales_price",
                      ].includes(field)}
                    />
                  )}
                </div>
              ))}

              {/* Dropdowns */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select
                  options={categories}
                  value={categories.find(
                    (c) => c.value === formData.category_id
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, category_id: opt?.value || "" })
                  }
                  isLoading={loading.cat}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <Select
                  options={brands}
                  value={brands.find((b) => b.value === formData.brand_id)}
                  onChange={(opt) =>
                    setFormData({ ...formData, brand_id: opt?.value || "" })
                  }
                  isLoading={loading.brand}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <Select
                  options={suppliers}
                  value={suppliers.find(
                    (s) => s.value === formData.supplier_id
                  )}
                  onChange={(opt) =>
                    setFormData({ ...formData, supplier_id: opt?.value || "" })
                  }
                  isLoading={loading.supp}
                  placeholder="Select"
                  className="mt-1"
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="font-medium">{formatValue(key, value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockInventoryReportDetails;
