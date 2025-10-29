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
} from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import SignOutModal from "./SignOutModal";
import logo from "../../assets/logo-d.png";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #B34949;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3A0E0F;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #B34949 #f1f1f1;
  }
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
      id: "product-list",
      label: "Product List",
      icon: List,
      path: "/dashboard/product-list",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Grid,
      path: "/dashboard/categories",
    },
    {
      id: "orders",
      label: "Order Management",
      icon: Package,
      path: "/dashboard/orders",
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
      id: "customers",
      label: "Customers",
      icon: Users,
      path: "/dashboard/customers",
    },
    {
      id: "Inventory",
      label: "Inventory",
      icon: Archive,
      path: "/dashboard/inventories",
    },
    {
      id: "coupon-code",
      label: "Coupon Code",
      icon: Tag,
      path: "/dashboard/coupon-code",
    },
    {
      id: "report",
      label: "Report",
      icon: FileText,
      path: "/dashboard/report",
    },
    {
      id: "customization",
      label: "Customization",
      icon: Box,
      path: "/dashboard/customization",
    },
    {
      id: "product-reviews",
      label: "Product Reviews",
      icon: Star,
      path: "/dashboard/product-reviews",
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
    {
      id: "admin-role",
      label: "Admin Role",
      icon: UserCog,
      path: "/dashboard/admin-role",
    },
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
        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/90 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={18} strokeWidth={2} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    ) : (
      <button
        onClick={item.action}
        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/90 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={18} strokeWidth={2} />
        <span className="text-sm font-medium">{item.label}</span>
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
      <aside
        className={`fixed inset-y-0 left-0 w-64 py-6 bg-gradient-to-b from-[#B34949] via-[#bd2f31] to-[#9e0205] text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 custom-scrollbar overflow-y-auto`}
      >
        {/* Brand and Close Button */}
        <div className="flex items-center justify-between md:justify-center mb-6 p-4 md:p-2">
          <img src={logo} alt="Sabilay Logo" className="h-10 w-auto" />
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
              />
            ))}
          </div>
          <div className="border-t border-white/10 mt-auto">
            <div className="space-y-0.5 py-2">
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
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
      />
    </>
  );
};

export default Sidebar;
