import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Home,
  Package,
  Users,
  Tag,
  Grid,
  CreditCard,
  Box,
  Percent,
  List,
  Star,
  FileText,
  Settings,
  UserCog,
  Archive,
  LogOut,
  Menu,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
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
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const activeItem = location.pathname.split("/").pop() || "dashboard";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      path: "/dashboard/customers",
    },
    {
      id: "orders",
      label: "Order Management",
      icon: Package,
      path: "/dashboard/orders",
    },
    {
      id: "product-list",
      label: "Product List",
      icon: List,
      path: "/dashboard/product-list",
    },
    { id: "tags", label: "Tags", icon: Box, path: "/dashboard/tags" },
    {
      id: "categories",
      label: "Categories",
      icon: Grid,
      path: "/dashboard/categories",
    },
    {
      id: "tax-management",
      label: "Tax Management",
      icon: Percent,
      path: "/dashboard/tax-management",
    },
    {
      id: "DeliveryFeeManager",
      label: "Delivery Fee Manager",
      icon: CreditCard,
      path: "/dashboard/delivery-fee-manager",
    },
    {
      id: "coupon-code",
      label: "Coupon Code",
      icon: Tag,
      path: "/dashboard/coupon-code",
    },
    { id: "brand", label: "Brand", icon: Archive, path: "/dashboard/brand" },
    {
      id: "supplier",
      label: "Supplier",
      icon: FileText,
      path: "/dashboard/suppliers",
    },
    {
      id: "report",
      label: "Report",
      icon: FileText,
      path: "/dashboard/report",
    },
    // {
    //   id: "customization",
    //   label: "Customization",
    //   icon: Box,
    //   path: "/dashboard/customization",
    // },
    // {
    //   id: "product-reviews",
    //   label: "Product Reviews",
    //   icon: Star,
    //   path: "/dashboard/product-reviews",
    // },
  ];

  const bottomItems = [
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: Settings,
    //   path: "/dashboard/settings",
    // },
    // {
    //   id: "admin-role",
    //   label: "Admin Role",
    //   icon: UserCog,
    //   path: "/dashboard/admin-role",
    // },
    {
      id: "logout",
      label: "Log Out",
      icon: LogOut,
      action: () => setIsSignOutModalOpen(true),
    },
  ];

  const MenuItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return item.path ? (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-1.5 py-3 text-sm font-medium transition-all duration-200 rounded-lg mx-2 ${
          isActive
            ? "bg-white text-[#B34949]"
            : "text-white/90 hover:bg-white/10"
        }`}
      >
        <Icon size={18} />
        {isOpen && <span>{item.label}</span>}
      </Link>
    ) : (
      <button
        onClick={item.action}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mx-2 w-full ${
          isActive
            ? "bg-white text-[#B34949]"
            : "text-white/90 hover:bg-white/10"
        }`}
      >
        <Icon size={18} />
        {isOpen && <span>{item.label}</span>}
      </button>
    );
  };

  const handleSignOutConfirm = () => {
    logout();
    navigate("/admin/signin");
  };

  return (
    <>
      <style>{scrollbarStyles}</style>

      {/* Collapsed Sidebar (Icons Only) */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-[#B34949] via-[#bd2f31] to-[#9e0205] text-white transition-all duration-300 z-50 flex flex-col ${
          isOpen ? "w-64" : "w-16"
        } custom-scrollbar overflow-y-auto`}
      >
        {/* Header: Logo + Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div
            className={`flex items-center gap-3 ${
              isOpen ? "" : "justify-center"
            }`}
          >
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            {/* {isOpen && <span className="font-bold text-lg">Sabilay</span>} */}
          </div>
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
              />
            ))}
          </div>

          <div className="border-t border-white/10 mt-4 pt-4">
            <div className="space-y-1">
              {bottomItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                />
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile (if needed) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
      />
    </>
  );
};

export default Sidebar;
