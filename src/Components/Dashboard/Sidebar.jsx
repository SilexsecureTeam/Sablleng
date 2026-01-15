// src/components/admin/Sidebar.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Home,
  Package,
  Users,
  List,
  Tag,
  Grid,
  Percent,
  CreditCard,
  Archive,
  FileText,
  UserCog,
  Settings,
  LogOut,
  Menu,
  LayoutPanelTop,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContextObject";
import Can from "./Can";
import SignOutModal from "./SignOutModal";
import logo from "../../assets/logo-d.png";

// Custom scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #B34949; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3A0E0F; }
  .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #B34949 #f1f1f1; }
`;

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = React.useState(false);

  const currentPath = location.pathname;

  // MENU ITEMS — Clean & Logical
  const menuItems = [
    // Everyone (non-admin) sees these
    {
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      label: "Orders",
      icon: Package,
      path: "/dashboard/orders",
      permission: "orders.view",
    },
    {
      label: "Customers",
      icon: Users,
      path: "/dashboard/customers",
      permission: "customers.view",
    },
    {
      label: "Products",
      icon: List,
      path: "/dashboard/product-list",
      permission: "products.view",
    },

    // ADMIN-ONLY MENUS — No permission needed in list (admin bypasses all)
    // These will be wrapped in <Can perform="admin.only"> or just use a dummy permission
    {
      label: "Categories",
      icon: Grid,
      path: "/dashboard/categories",
      permission: "admin.only",
    },
    {
      label: "Hero Banners",
      icon: LayoutPanelTop,
      path: "/dashboard/hero",
      permission: "admin.only",
    },
    {
      label: "About Us",
      icon: LayoutPanelTop,
      path: "/dashboard/about",
      permission: "admin.only",
    },
    {
      label: "Team Management",
      icon: LayoutPanelTop,
      path: "/dashboard/team",
      permission: "admin.only",
    },
    {
      label: "Partnership Logos",
      icon: LayoutPanelTop,
      path: "/dashboard/partnership-logos",
      permission: "admin.only",
    },
    {
      label: "Tags",
      icon: Tag,
      path: "/dashboard/tags",
      permission: "tags.view",
    },
    {
      label: "Brands",
      icon: Archive,
      path: "/dashboard/brand",
      permission: "brands.view",
    },
    {
      label: "Suppliers",
      icon: FileText,
      path: "/dashboard/suppliers",
      permission: "suppliers.view",
    },
    {
      label: "Coupon Codes",
      icon: Tag,
      path: "/dashboard/coupon-code",
      permission: "admin.only",
    },
    {
      label: "Tax Management",
      icon: Percent,
      path: "/dashboard/tax-management",
      permission: "admin.only",
    },
    {
      label: "Delivery Fees",
      icon: CreditCard,
      path: "/dashboard/delivery-fee-manager",
      permission: "admin.only",
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/dashboard/report",
      permission: "analytics.view",
    },
    {
      label: "EPOS",
      icon: FileText,
      path: "/dashboard/epos",
      permission: "admin.only",
    },

    // Bottom: Admin Only
    {
      label: "Staff Management",
      icon: UserCog,
      path: "/dashboard/staff-role",
      permission: "staff.view",
    },
    // {
    //   label: "Settings",
    //   icon: Settings,
    //   path: "/dashboard/settings",
    //   permission: "admin.only",
    // },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/dashboard/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      <style>{scrollbarStyles}</style>

      <aside
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-[#B34949] via-[#bd2f31] to-[#9e0205] text-white transition-all duration-300 z-50 flex flex-col ${
          isOpen ? "w-64" : "w-16"
        } custom-scrollbar overflow-y-auto`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 p-2 rounded"
          >
            {isOpen ? (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-9" />
                <XMarkIcon className="h-6 w-6" />
              </div>
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <Can perform={item.permission} key={item.path || item.label}>
              <Link
                to={item.path}
                className={`
  flex ${isOpen ? "justify-start pl-4" : "justify-center"} 
  items-center gap-3 py-3 rounded-lg transition-all 
  ${isActive(item.path) ? "bg-white text-[#B34949]" : "hover:bg-white/10"}
`}
              >
                <item.icon size={20} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            </Can>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-sm"
          >
            <LogOut size={20} />
            {isOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={() => {
          logout();
        }}
      />
    </>
  );
};

export default Sidebar;
