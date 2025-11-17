import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const StockInventoryReportForm = ({ onSave, onCancel }) => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    order_code: "",
    current_stock: "",
    cost_price: "",
    sales_price: "",
    category_id: "",
    brand_id: "",
    supplier_id: "",
    // total_cost: "",
    // total_value: "",
    // margin: "",
    // margin_percentage: "",
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState({
    cat: false,
    brand: false,
    supp: false,
    submit: false,
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
        toast.error("Failed to load categories");
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
        toast.error("Failed to load brands");
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
        toast.error("Failed to load suppliers");
        console.log(err);
      } finally {
        setLoading((prev) => ({ ...prev, supp: false }));
      }
    };

    if (auth?.token) {
      Promise.all([fetchCategories(), fetchBrands(), fetchSuppliers()]);
    }
  }, [auth?.token]);

  const validateBarcode = (barcode) => /^\d{13}$/.test(barcode.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateBarcode(formData.barcode)) {
      toast.error("Barcode must be exactly 13 digits", { autoClose: 5000 });
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    const data = new FormData();
    Object.keys(formData).forEach((k) => {
      if (formData[k] !== "") data.append(k, formData[k]);
    });

    try {
      const res = await fetch("https://api.sablle.ng/api/stockInventory", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: data,
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch {}

      if (!res.ok) {
        const errMsg = json?.error || json?.message || "Failed to create";
        if (errMsg.toLowerCase().includes("barcode")) {
          toast.error("This barcode is already taken.", { autoClose: 5000 });
        } else {
          toast.error(errMsg);
        }
        return;
      }

      toast.success("Inventory item created successfully!", {
        autoClose: 3000,
      });

      // REFETCH FULL ITEM WITH category_name
      try {
        const itemRes = await fetch(
          `https://api.sablle.ng/api/stockInventory/${json.data.id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        const itemJson = await itemRes.json();
        const fullItem = itemJson.data || itemJson;
        onSave(fullItem); // This now includes category_name
      } catch (err) {
        console.log("Failed to refetch item:", err);
        onSave(); // fallback
      }
    } catch (err) {
      toast.error("Network error. Check console.");
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Add New Stock Item</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Barcode <span className="text-xs text-gray-500">(13 digits)</span>
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 13);
                setFormData({ ...formData, barcode: val });
              }}
              placeholder="1234567890123"
              maxLength={13}
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327] font-mono"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.barcode.length}/13
            </p>
          </div>

          {/* Order Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order Code
            </label>
            <input
              type="text"
              value={formData.order_code}
              onChange={(e) =>
                setFormData({ ...formData, order_code: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
            />
          </div>

          {/* Current Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Stock
            </label>
            <input
              type="number"
              value={formData.current_stock}
              onChange={(e) =>
                setFormData({ ...formData, current_stock: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              min="0"
              required
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({ ...formData, cost_price: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              min="0"
              required
            />
          </div>

          {/* Sales Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sales Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.sales_price}
              onChange={(e) =>
                setFormData({ ...formData, sales_price: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              min="0"
              required
            />
          </div>

   
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Cost
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={(e) =>
                setFormData({ ...formData, total_cost: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              min="0"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Value
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total_value}
              onChange={(e) =>
                setFormData({ ...formData, total_value: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
              min="0"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Margin
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.margin}
              onChange={(e) =>
                setFormData({ ...formData, margin: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Margin %
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.margin_percentage}
              onChange={(e) =>
                setFormData({ ...formData, margin_percentage: e.target.value })
              }
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
            />
          </div> */}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              options={categories}
              onChange={(opt) =>
                setFormData({ ...formData, category_id: opt?.value || "" })
              }
              isLoading={loading.cat}
              placeholder="Select Category"
              className="mt-1"
              styles={selectStyles}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <Select
              options={brands}
              onChange={(opt) =>
                setFormData({ ...formData, brand_id: opt?.value || "" })
              }
              isLoading={loading.brand}
              placeholder="Select Brand"
              className="mt-1"
              styles={selectStyles}
            />
          </div>

          {/* Supplier - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <Select
              options={suppliers}
              onChange={(opt) =>
                setFormData({ ...formData, supplier_id: opt?.value || "" })
              }
              isLoading={loading.supp}
              placeholder="Select Supplier"
              className="mt-1"
              styles={selectStyles}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 col-span-2">
  Total Cost, Total Value, Margin & Margin % are calculated automatically.
</p>



        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading.submit}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading.submit}
            className="px-5 py-2 bg-[#5F1327] hover:bg-[#B54F5E] text-white rounded-md font-medium transition-colors disabled:opacity-70"
          >
            {loading.submit ? "Saving..." : "Save Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockInventoryReportForm;
