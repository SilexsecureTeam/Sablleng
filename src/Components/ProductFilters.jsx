// src/components/ProductFilters.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, X } from "lucide-react";
import SearchInput from "./SearchInput"; // ← THE MAGIC

const ProductFilters = ({ products = [], onFiltered }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showCustomizable, setShowCustomizable] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Price bounds
  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 100000];
    const prices = products
      .map((p) => parseFloat(p.sale_price_inc_tax) || 0)
      .filter((p) => p > 0);
    return prices.length
      ? [Math.min(...prices), Math.max(...prices)]
      : [0, 100000];
  }, [products]);
  const availableBrands = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.brand?.id) {
        map.set(p.brand.id, p.brand.name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [products]);

  const availableSuppliers = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.supplier?.id) {
        map.set(p.supplier.id, p.supplier.name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [products]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  // FILTER + SORT
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    }

    filtered = filtered.filter((p) => {
      const price = parseFloat(p.sale_price_inc_tax) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (showCustomizable)
      filtered = filtered.filter((p) => p.customize === true);
    if (showPopular)
      filtered = filtered.filter((p) => (p.customization?.length || 0) >= 5);
    if (showOnSale) {
      filtered = filtered.filter((p) => {
        const sale = parseFloat(p.sale_price_inc_tax) || 0;
        const cost = parseFloat(p.cost_inc_tax) || 0;
        return sale > 0 && cost > 0 && sale < cost;
      });
    }

    if (showNew) {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (showPopular) {
      filtered.sort(
        (a, b) =>
          (b.customization?.length || 0) - (a.customization?.length || 0)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(
        (p) => p.brand?.id && selectedBrands.includes(p.brand.id)
      );
    }
    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter(
        (p) => p.supplier?.id && selectedSuppliers.includes(p.supplier.id)
      );
    }

    return filtered;
  }, [
    products,
    searchTerm,
    priceRange,
    showCustomizable,
    showPopular,
    showOnSale,
    showNew,
    selectedBrands,
    selectedSuppliers,
  ]);

  const handleFiltered = useCallback((list) => onFiltered(list), [onFiltered]);

  useEffect(() => {
    handleFiltered(filteredProducts);
  }, [filteredProducts, handleFiltered]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange(priceBounds);
    setShowCustomizable(false);
    setShowPopular(false);
    setShowOnSale(false);
    setShowNew(false);
    setSelectedBrands([]);
    setSelectedSuppliers([]);
  };

  const FilterContent = () => (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-[#5F1327] underline hover:no-underline"
        >
          Clear all
        </button>
      </div>

      {/* SMOOTH SEARCH — NEVER LOSES FOCUS */}
      <SearchInput value={searchTerm} onChange={setSearchTerm} />

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Price: ₦{priceRange[0].toLocaleString()} - ₦
          {priceRange[1].toLocaleString()}
        </label>
        <input
          type="range"
          min={priceBounds[0]}
          max={priceBounds[1]}
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
          className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5F1327]"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <Toggle
          label="Customizable Only"
          checked={showCustomizable}
          onChange={setShowCustomizable}
        />
        <Toggle
          label="Popular (5+ custom designs)"
          checked={showPopular}
          onChange={setShowPopular}
        />
        <Toggle label="On Sale" checked={showOnSale} onChange={setShowOnSale} />
        <Toggle
          label="Sort: Newest First"
          checked={showNew}
          onChange={setShowNew}
        />
        <div className="space-y-3">
          <h4 className="font-medium">Brand</h4>
          {availableBrands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBrands([...selectedBrands, brand.id]);
                  } else {
                    setSelectedBrands(
                      selectedBrands.filter((id) => id !== brand.id)
                    );
                  }
                }}
              />
              <span>{brand.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-3 mt-6">
        <h4 className="font-medium">Supplier</h4>
        {availableSuppliers.map((supplier) => (
          <label key={supplier.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedSuppliers.includes(supplier.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSuppliers((prev) => [...prev, supplier.id]);
                } else {
                  setSelectedSuppliers((prev) =>
                    prev.filter((id) => id !== supplier.id)
                  );
                }
              }}
            />
            <span>{supplier.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-5 py-3 bg-[#5F1327] text-white rounded-lg font-medium mb-6 shadow-md hover:shadow-lg transition"
      >
        <Filter size={20} />
        Filters ({filteredProducts.length})
      </button>

      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl border shadow-lg sticky top-24">
          <FilterContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Filters</h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <FilterContent />
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-4 bg-[#5F1327] text-white text-lg font-bold rounded-lg hover:bg-[#4a1020] transition"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 text-[#5F1327] rounded focus:ring-2 focus:ring-[#5F1327]"
    />
    <span className="text-sm text-gray-700 font-medium">{label}</span>
  </label>
);

export default ProductFilters;
