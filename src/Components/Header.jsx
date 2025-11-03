import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Loader2,
  UserCircle,
  Package,
  Heart,
  LogOut,
} from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
import logo from "../assets/logo-d.png";
import { toast } from "react-toastify";
import { getSubCategories } from "../utils/categoryGroups";

const Header = () => {
  const { items } = useContext(CartContext);
  const { auth, logout } = useContext(AuthContext);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const timeoutRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Static main categories (matching Category1.jsx)
  const mainCategories = [
    { id: 1, name: "Christmas", slug: "christmas" },
    { id: 2, name: "Hampers", slug: "hampers" },
    { id: 3, name: "Corporate", slug: "corporate" },
    { id: 4, name: "Exclusive at sabblle", slug: "exclusive-at-sabblle" },
    { id: 5, name: "For Him", slug: "for-him" },
    { id: 6, name: "For Her", slug: "for-her" },
    { id: 7, name: "Birthday", slug: "birthday" },
    { id: 8, name: "Confectionery", slug: "confectionery" },
  ];

  // Calculate total items in cart
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return "U";

    const nameParts = name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length === 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
  };

  // Fetch all active categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCategories(true);
      setErrorCategories(null);

      try {
        const categoryResponse = await fetch(
          "https://api.sablle.ng/api/categories",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoryResponse.statusText}`
          );
        }

        const categoriesData = await categoryResponse.json();
        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : [];

        const formattedCategories = categoriesArray
          .filter((item) => item.is_active === 1)
          .map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, ""),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(formattedCategories);
      } catch (err) {
        console.error("Fetch error:", err);
        setErrorCategories(err.message);
        toast.error(`Error loading categories: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setProfileOpen((prev) => !prev);
  };

  // Close mobile menu and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenu(false);
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown for specific main category (mobile)
  const toggleDropdown = (slug) => {
    setActiveDropdown((prev) => (prev === slug ? null : slug));
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  // Handle desktop hover with delay
  const handleMouseEnter = (slug) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250); // 250ms delay before closing
  };

  return (
    <>
      {/* Noti Bar - Always Visible, Sticky at Top */}
      <div className="bg-[#5F1327] sticky top-0 z-50 text-center border-b border-[#5F1327]/20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row sm:justify-between items-center gap-2 sm:gap-0 py-2">
          {/* Left: Phone/Email */}
          <h2 className="text-white text-xs sm:text-sm font-semibold order-3 sm:order-1 flex-shrink-0">
            +2348187230200 | <span className="underline">info@sablle.ng</span>
          </h2>

          {/* Center: Logo */}
          <Link to="/" className="order-2 sm:order-2 flex-shrink-0">
            <img
              src={logo}
              alt="Sablle Logo"
              className="w-[100px] sm:w-[120px] h-[20px] sm:h-[25px]"
            />
          </Link>

          {/* Right: Search, Profile, Cart */}
          <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-3 flex-shrink-0">
            <button
              className="text-white cursor-pointer hover:text-gray-200 transition-colors duration-200"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              {auth.isAuthenticated ? (
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors duration-200"
                  aria-label="User Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#5F1327] font-semibold text-sm">
                    {getInitials(auth.user?.name)}
                  </div>
                  <span className="hidden sm:inline-block text-xs sm:text-sm font-medium">
                    {auth.user?.name || "User"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`hidden sm:inline-block transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="text-white cursor-pointer hover:text-gray-200 transition-colors duration-200"
                  aria-label="User Profile"
                >
                  <User size={20} />
                </Link>
              )}
              {auth.isAuthenticated && profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-2 border border-gray-100 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#5F1327] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {getInitials(auth.user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {auth.user?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {auth.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserCircle size={18} />
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Package size={18} />
                      <span className="text-sm font-medium">Order History</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Heart size={18} />
                      <span className="text-sm font-medium">My Wishlist</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        setMobileMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="text-white cursor-pointer hover:text-gray-200 transition-colors duration-200 relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#5F1327] text-xs px-1 py-0 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white hover:text-gray-200 transition-colors duration-200"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label={mobileMenu ? "Close Menu" : "Open Menu"}
            >
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-[#5F1327] text-white border-t border-[#5F1327]/20"
          >
            {/* Mobile Categories */}
            <div className="space-y-1">
              {mainCategories.map((main) => {
                const subs = getSubCategories(main.slug, categories);
                return (
                  <div
                    key={main.id}
                    className="border-t border-[#5F1327]/20 first:border-t-0"
                  >
                    <button
                      onClick={() => toggleDropdown(main.slug)}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#5F1327]/20 transition-colors duration-200 sm:py-2"
                    >
                      <span className="text-sm font-medium">{main.name}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          activeDropdown === main.slug ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === main.slug && (
                      <div className="bg-[#5F1327]/10 space-y-1 px-4 pb-3">
                        <Link
                          to={`/groups/${main.slug}`}
                          className="block py-2 text-sm font-semibold text-white hover:text-gray-200 border-b border-[#5F1327]/20"
                          onClick={() => {
                            setMobileMenu(false);
                            closeAllDropdowns();
                          }}
                        >
                          View All {main.name}
                        </Link>
                        {subs.length > 0 ? (
                          <div className="space-y-1 pt-2">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/categories/${sub.slug}`}
                                className="block py-1.5 text-sm text-gray-200 hover:text-white pl-4 border-l border-gray-300"
                                onClick={() => {
                                  setMobileMenu(false);
                                  closeAllDropdowns();
                                }}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="py-2 text-gray-300 text-sm">
                            No subcategories available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {auth.isAuthenticated ? (
              <>
                <div className="border-t border-[#5F1327]/20 pt-2 px-4 pb-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200"
                    onClick={() => setMobileMenu(false)}
                  >
                    <UserCircle size={18} />
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200"
                    onClick={() => setMobileMenu(false)}
                  >
                    <Package size={18} />
                    <span className="text-sm font-medium">Order History</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200"
                    onClick={() => setMobileMenu(false)}
                  >
                    <Heart size={18} />
                    <span className="text-sm font-medium">My Wishlist</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenu(false);
                    }}
                    className="flex items-center gap-3 w-full py-2 text-red-300 hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-[#5F1327]/20 pt-2 px-4 pb-4">
                <Link
                  to="/signin"
                  className="block py-2 hover:bg-[#5F1327]/20 transition-colors duration-200 text-center"
                  onClick={() => setMobileMenu(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav Links - Centered, White BG, Always Below Noti */}
      <nav className="bg-white sticky top-10 z-40 border-b border-gray-200">
        {" "}
        {/* FIXED: top-10 to stack below Noti (approx height) */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex flex-wrap font-medium items-center justify-center gap-6 py-3 md:py-4">
            {mainCategories.map((main) => {
              const subs = getSubCategories(main.slug, categories);
              return (
                <div
                  key={main.id}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(main.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/groups/${main.slug}`}
                    className="flex items-center gap-1 text-gray-700 hover:text-[#5F1327] transition-colors duration-200 whitespace-nowrap"
                  >
                    {main.name}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        activeDropdown === main.slug ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                  {activeDropdown === main.slug && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 bg-white shadow-lg rounded-lg py-2 border border-gray-100 opacity-100 transition-all duration-300 ease-in-out scale-100 overflow-hidden max-h-96 overflow-y-auto z-50">
                      {isLoadingCategories ? (
                        <div className="px-4 py-2 flex items-center gap-2 text-gray-500">
                          <Loader2 size={16} className="animate-spin" />
                          Loading subcategories...
                        </div>
                      ) : errorCategories ? (
                        <div className="px-4 py-2 text-red-500 text-sm">
                          Error loading subcategories
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            to={`/groups/${main.slug}`}
                            className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#5F1327] hover:text-white transition-colors duration-200 text-center"
                          >
                            View All {main.name}
                          </Link>
                          {subs.length > 0 ? (
                            <div className="space-y-1">
                              {subs.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={`/categories/${sub.slug}`}
                                  className="block px-4 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200 truncate"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm text-center">
                              No subcategories available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile/Desktop Responsive Nav - Show main categories as simple links on small screens */}
          <div className="md:hidden flex flex-wrap justify-center gap-4 py-2 px-2">
            {mainCategories.map((main) => (
              <Link
                key={main.id}
                to={`/groups/${main.slug}`}
                className="text-sm text-gray-700 hover:text-[#5F1327] transition-colors duration-200 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                {main.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
