// src/constants/permissions.js
const PERMISSIONS = {
  "dashboard.view": ["manager", "stock_manager", "customer_care"],

  "products.view": ["manager", "stock_manager", "customer_care"],
  "products.create": ["manager"],
  "products.update": ["manager"],
  "products.delete": ["manager"],

  "brands.view": ["manager", "stock_manager", "customer_care"],
  "brands.create": ["manager"],
  "brands.update": ["manager"],
  "brands.delete": ["manager"],

  "suppliers.view": ["manager", "stock_manager", "customer_care"],
  "suppliers.create": ["manager"],
  "suppliers.update": ["manager"],
  "suppliers.delete": ["manager"],

  "tags.view": ["manager", "stock_manager", "customer_care"],
  "tags.create": ["manager"],
  "tags.update": ["manager"],
  "tags.delete": ["manager"],

  "stock.create": ["stock_manager"],
  "stock.update": ["stock_manager"],
  "stock.view": ["stock_manager"],
  "stock.delete": ["stock_manager"],

  "orders.view": ["manager", "customer_care"],
  "orders.update": ["manager", "customer_care"],
  "orders.cancel": ["manager"],

  "customers.view": ["manager", "customer_care"],
  "customers.edit": ["customer_care"],
//   "customers.delete": [], 

//   "staff.view": [],        
//   "staff.create": [],
//   "staff.edit": [],
//   "staff.delete": [],

  "analytics.view": ["manager"],

  "admin.only": [],
};

export default PERMISSIONS;