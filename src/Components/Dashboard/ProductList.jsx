import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([
    {
      sku: "P001",
      product: "Paradise Notebook",
      category: "office & writing-tools",
      type: "Customizable",
      price: "N2,500",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Corporate Pen Set",
      category: "office & writing-tools",
      type: "Non-custom",
      price: "N2,800",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Leather Portfolio",
      category: "office & writing-tools",
      type: "Customizable",
      price: "N3,500",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Branded Handbook",
      category: "office & writing-tools",
      type: "Non-custom",
      price: "N2,000",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Branded Notebook",
      category: "office & writing-tools",
      type: "Customizable",
      price: "N7,500",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Corporate Pen Set",
      category: "office & writing-tools",
      type: "Non-custom",
      price: "N2,000",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Leather Portfolio",
      category: "office & writing-tools",
      type: "Customizable",
      price: "N2,500",
      stock: 50,
    },
    {
      sku: "P001",
      product: "Branded Notebook",
      category: "office & writing-tools",
      type: "Non-custom",
      price: "N2,500",
      stock: 50,
    },
  ]);

  const handleEdit = (index) => {
    console.log("Edit product at index:", index);
  };

  const handleNewProduct = () => {
    console.log("New product clicked");
  };

  const filteredProducts = products.filter(
    (product) =>
      product.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Title and New Product Button */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Products Inventory
            </h1>
            <button
              onClick={handleNewProduct}
              className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {product.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.type === "Customizable" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Customizable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          Non-custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(index)}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                No products found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
