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
} from "lucide-react";
import { CartContext } from "../context/CartContextObject";
import { AuthContext } from "../context/AuthContextObject";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";

const Header = () => {
  const { items } = useContext(CartContext);
  const { auth, logout } = useContext(AuthContext);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const timeoutRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Calculate total items in cart
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch all active categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCategories(true);
      setErrorCategories(null);

      try {
        // Fetch categories
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

        // Filter active categories and format them
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
          // Sort alphabetically by name
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

  // Handle dropdown delay for desktop (categories)
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCategoryOpen(true), 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCategoryOpen(false), 200);
  };

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
        setCategoryOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between py-3 md:py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          <img src={logo} alt="Sablle Logo" className="w-[120px] h-[25px]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex font-medium items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
          >
            Home
          </Link>
          <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200">
              Categories{" "}
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-2 border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform scale-95 group-hover:scale-100 overflow-hidden max-h-96 overflow-y-auto">
                {isLoadingCategories ? (
                  <div className="px-4 py-2 flex items-center gap-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading categories...
                  </div>
                ) : errorCategories ? (
                  <div className="px-4 py-2 text-red-500 text-sm">
                    Error loading categories
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/categories/${category.slug}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-[#CB5B6A] hover:text-white transition-colors duration-200"
                      onClick={() => setCategoryOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
          <Link
            to="/about"
            className="text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
          >
            About Us
          </Link>
          <Link
            to="/product"
            className="text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
          >
            Product
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="text-gray-700 cursor-pointer hover:text-[#CB5B6A] transition-colors duration-200"
            aria-label="Search"
          >
            <Search size={22} />
          </button>
          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            {auth.isAuthenticated ? (
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-1 text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
                aria-label="User Profile"
              >
                <User size={22} />
                <span className="hidden sm:inline-block text-sm font-medium">
                  {auth.user?.name || "User"}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <Link
                to="/signin"
                className="text-gray-700 cursor-pointer hover:text-[#CB5B6A] transition-colors duration-200"
                aria-label="User Profile"
              >
                <User size={22} />
              </Link>
            )}
            {auth.isAuthenticated && profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg py-2 border border-gray-100 transition-all duration-300 ease-in-out">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Name: {auth.user?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {auth.user?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Role: {auth.role || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                    setMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-[#CB5B6A] hover:text-white transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className="text-gray-700 cursor-pointer hover:text-[#CB5B6A] transition-colors duration-200 relative"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#CB5B6A] text-white text-xs px-1.5 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link
            to="#"
            onClick={(e) => e.preventDefault()}
            className="hidden md:inline-block ml-6 bg-[#CB5B6A] text-white px-4 py-2 rounded-full shadow hover:bg-[#b34f5c] transition-colors duration-200"
          >
            Customize Item
          </Link>
          <button
            className="md:hidden text-gray-700 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? "Close Menu" : "Open Menu"}
          >
            {mobileMenu ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white shadow-md border-t px-4 py-2 transform transition-all duration-300 ease-in-out"
        >
          <Link
            to="/"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            Home
          </Link>
          <div className="">
            <button
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
              onClick={() => setCategoryOpen(!categoryOpen)}
            >
              Categories{" "}
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  categoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {categoryOpen && (
              <div className="pl-6 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                {isLoadingCategories ? (
                  <div className="px-4 py-2 flex items-center gap-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading categories...
                  </div>
                ) : errorCategories ? (
                  <div className="px-4 py-2 text-red-500 text-sm">
                    Error loading categories
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/categories/${category.slug}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-[#CB5B6A] hover:text-white transition-colors duration-200"
                      onClick={() => {
                        setMobileMenu(false);
                        setCategoryOpen(false);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
          <Link
            to="/about"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            About Us
          </Link>
          <Link
            to="/product"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            Product
          </Link>
          <Link
            to="/contact"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            Contact Us
          </Link>
          <Link
            to="/cart"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            Cart
          </Link>
          {auth.isAuthenticated ? (
            <>
              <div className="px-4 py-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">
                  Name: {auth.user?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {auth.user?.email || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Role: {auth.role || "N/A"}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-[#CB5B6A] hover:text-white transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#CB5B6A] transition-colors duration-200"
              onClick={() => setMobileMenu(false)}
            >
              Sign In
            </Link>
          )}
          <Link
            to="#"
            className="block bg-[#CB5B6A] text-white text-center mx-3 my-2 py-2 rounded-lg hover:bg-[#b34f5c] transition-colors duration-200"
            onClick={() => setMobileMenu(false)}
          >
            Customize Item
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
