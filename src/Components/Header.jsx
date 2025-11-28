// Updated Header.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { getTagCategories } from "../utils/categoryGroups";
import { useTags } from "../context/TagContext";
import HeaderSearch from "./HeaderSearch";

const Header = React.memo(() => {
  const location = useLocation();
  const { items } = useContext(CartContext);
  const { auth, logout } = useContext(AuthContext);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState([]);
  // const [tags, setTags] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  // const [isLoadingTags, setIsLoadingTags] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [errorCategories, setErrorCategories] = useState(null);
  // const [errorTags, setErrorTags] = useState(null);
  const timeoutRef = useRef(null);
  const profileRefDesktop = useRef(null);
  const profileRefMobile = useRef(null);
  const mobileMenuRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const { tags, isLoading: isLoadingTags, error: errorTags } = useTags();
  const [searchOpen, setSearchOpen] = useState(false);
  // Memoized cart item count
  const cartItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Get initials from user name
  const getInitials = useCallback((name) => {
    if (!name) return "U";

    const nameParts = name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length === 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
  }, []);

  // Fetch all active categories with localStorage caching
  useEffect(() => {
    const CACHE_KEY = "sablle_categories";
    const CACHE_EXPIRY = 30 * 1000; // 30 seconds

    const fetchData = async () => {
      setIsLoadingCategories(true);
      setErrorCategories(null);

      const cached = localStorage.getItem(CACHE_KEY);
      const now = new Date().getTime();
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (now - timestamp < CACHE_EXPIRY) {
          setCategories(data);
          setIsLoadingCategories(false);
          return;
        }
      }

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

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: formattedCategories,
            timestamp: now,
          })
        );

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

  // Fetch all active tags with localStorage caching
  // useEffect(() => {
  //   const CACHE_KEY = "sablle_tags";
  //   const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  //   const fetchData = async () => {
  //     setIsLoadingTags(true);
  //     setErrorTags(null);

  //     // Check cache first
  //     const cached = localStorage.getItem(CACHE_KEY);
  //     const now = new Date().getTime();
  //     if (cached) {
  //       const { data, timestamp } = JSON.parse(cached);
  //       if (now - timestamp < CACHE_EXPIRY) {
  //         setTags(data);
  //         setIsLoadingTags(false);
  //         return;
  //       }
  //     }

  //     try {
  //       const tagsResponse = await fetch("https://api.sablle.ng/api/tags", {
  //         method: "GET",
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       if (!tagsResponse.ok) {
  //         throw new Error(`Failed to fetch tags: ${tagsResponse.statusText}`);
  //       }

  //       const tagsData = await tagsResponse.json();
  //       const tagsArray = Array.isArray(tagsData) ? tagsData : [];

  //       const formattedTags = tagsArray
  //         .filter((item) => item.is_active === true)
  //         .map((item) => ({
  //           id: item.id,
  //           name: item.name,
  //           slug: item.slug,
  //           categories: item.categories || [],
  //         }))
  //         .sort((a, b) => a.name.localeCompare(b.name));

  //       // Cache it
  //       localStorage.setItem(
  //         CACHE_KEY,
  //         JSON.stringify({
  //           data: formattedTags,
  //           timestamp: now,
  //         })
  //       );

  //       setTags(formattedTags);
  //     } catch (err) {
  //       console.error("Fetch tags error:", err);
  //       setErrorTags(err.message);
  //       toast.error(`Error loading tags: ${err.message}`, {
  //         position: "top-right",
  //         autoClose: 5000,
  //       });
  //     } finally {
  //       setIsLoadingTags(false);
  //     }
  //   };

  //   fetchData();
  // }, []);
  // NEW: Real-time tags — no cache, always fresh
  // useEffect(() => {
  //   const fetchTags = async () => {
  //     setIsLoadingTags(true);
  //     try {
  //       const res = await fetch("https://api.sablle.ng/api/tags");
  //       const data = await res.json();

  //       const formattedTags = (Array.isArray(data) ? data : [])
  //         .filter((tag) => tag.is_active === true)
  //         .map((tag) => ({
  //           id: tag.id,
  //           name: tag.name,
  //           slug: tag.slug,
  //           categories: tag.categories || [],
  //         }))
  //         .sort((a, b) => a.name.localeCompare(b.name));

  //       setTags(formattedTags);
  //     } catch (err) {
  //       console.error("Failed to load tags:", err);
  //       setErrorTags("Failed to load menu");
  //     } finally {
  //       setIsLoadingTags(false);
  //     }
  //   };

  //   fetchTags();
  // }, []);

  // Close profile dropdown when location changes
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // Handle profile dropdown toggle
  const toggleProfileDropdown = useCallback(() => {
    setProfileOpen((prev) => !prev);
  }, []);

  // 2. Update useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target)
      ) {
        setMobileMenu(false);
        setActiveDropdown(null);
      }

      const isOutsideDesktop =
        profileRefDesktop.current &&
        !profileRefDesktop.current.contains(event.target);
      const isOutsideMobile =
        profileRefMobile.current &&
        !profileRefMobile.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (mobileMenu && event.key === "Escape") {
        setMobileMenu(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenu]);

  // Toggle dropdown for specific tag (mobile)
  const toggleDropdown = useCallback((slug) => {
    setActiveDropdown((prev) => (prev === slug ? null : slug));
  }, []);

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Handle desktop hover with delay
  const handleMouseEnter = useCallback((slug) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(slug);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250); // 250ms delay before closing
  }, []);

  // Close on overlay click
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) {
        setMobileMenu(false);
        closeAllDropdowns();
      }
    },
    [closeAllDropdowns]
  );

  // Close mobile menu handler
  const handleCloseMenu = useCallback(() => {
    setMobileMenu(false);
    closeAllDropdowns();
  }, [closeAllDropdowns]);

  return (
    <div className="w-full bg-white sticky top-0 z-50">
      {/* Noti Bar - Always Visible, Sticky at Top */}
      <div className="bg-[#5F1327] py-2 sticky top-0 z-50 text-center border-b border-[#5F1327]/20">
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 md:px-8">
          {/* Desktop: Phone Left, Logo Center, Icons Right */}
          <div className="hidden md:flex items-center justify-between py-1.5 xs:py-2">
            {/* Left: Phone/Email */}
            <div className="text-white hidden text-xs xs:text-sm font-semibold fle items-center gap-4">
              <span>+2348187230200</span>
              <span>|</span>
              <span className="underline">info@sablle.ng</span>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="flex-shrink-0 mx-auto">
              <img
                src={logo}
                alt="Sablle Logo"
                className="w-[120px] h-[25px]"
              />
            </Link>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Desktop: Search Icon → Expands Full Width Below Logo Row */}
              {!searchOpen ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <Search size={20} />
                </button>
              ) : (
                <div className="absolute left-0 right-0 top-full bg-[#5F1327] px-4 py-3 shadow-lg z-50 hidden md:block">
                  <div className="max-w-3xl mx-auto">
                    <HeaderSearch
                      autoFocus
                      onClose={() => setSearchOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* Right: Icons */}
              <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 relative">
                {/* Profile Section */}
                <div className="relative z-10" ref={profileRefDesktop}>
                  {auth.isAuthenticated ? (
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors duration-200 relative z-20"
                      aria-label="User Profile"
                      aria-expanded={profileOpen}
                      role="button"
                    >
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#5F1327] font-semibold text-sm">
                        {getInitials(auth.user?.name)}
                      </div>
                      <span className="text-sm font-medium">
                        {auth.user?.name || "User"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      to="/signin"
                      className="text-white cursor-pointer hover:text-gray-200 transition-colors duration-200"
                      aria-label="Sign In"
                    >
                      <User size={20} />
                    </Link>
                  )}
                  {auth.isAuthenticated && profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-2 border border-gray-100 z-50 max-h-[70vh] overflow-y-auto">
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
                      <div className="py-1" role="menu">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <UserCircle size={18} />
                          <span className="text-sm font-medium">
                            My Profile
                          </span>
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Package size={18} />
                          <span className="text-sm font-medium">
                            Order History
                          </span>
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Heart size={18} />
                          <span className="text-sm font-medium">
                            My Wishlist
                          </span>
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                            setMobileMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-200"
                          role="menuitem"
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
                    <span className="absolute -top-1 -right-1 bg-white text-[#5F1327] text-xs px-1 py-0 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile: Hamburger, Logo, Icons Row */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* Left: Hamburger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenu(true);
              }}
              className="p-2 text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt="Sablle Logo"
                className="w-[120px] h-[25px]"
              />
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="md:hidden">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <Search size={20} />
                </button>
              </div>

              {/* Mobile: Fullscreen Search */}
              {searchOpen && (
                <>
                  {/* Dark backdrop */}
                  <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                    onClick={() => setSearchOpen(false)}
                  />

                  {/* Fullscreen Search Panel - Slides from Top */}
                  <div className="fixed top-0 left-0 right-0 bg-white z-50 md:hidden animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                      {/* Back Button */}
                      <button
                        onClick={() => setSearchOpen(false)}
                        className="text-gray-600 hover:text-gray-900"
                        aria-label="Close search"
                      >
                        <X size={28} />
                      </button>

                      {/* Search Input - Takes full width */}
                      <div className="flex-1">
                        <HeaderSearch
                          autoFocus={true}
                          onClose={() => setSearchOpen(false)}
                        />
                      </div>

                      {/* Optional: Cancel text (extra polish) */}
                      <button
                        onClick={() => setSearchOpen(false)}
                        className="text-[#5F1327] font-medium pr-2"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Optional: Recent searches or voice button can go here later */}
                  </div>
                </>
              )}

              {/* Profile Section - Mobile */}
              {/* Profile Section */}
              <div className="relative z-10" ref={profileRefMobile}>
                {auth.isAuthenticated ? (
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors duration-200 relative z-20"
                    aria-label="User Profile"
                    aria-expanded={profileOpen}
                    role="button"
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#5F1327] font-semibold text-sm">
                      {getInitials(auth.user?.name)}
                    </div>
                    {/* <span className="text-sm font-medium">
                      {auth.user?.name || "User"}
                    </span> */}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    className="text-white cursor-pointer hover:text-gray-200 transition-colors duration-200"
                    aria-label="Sign In"
                  >
                    <User size={20} />
                  </Link>
                )}
                {auth.isAuthenticated && profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-2 border border-gray-100 z-50 max-h-[70vh] overflow-y-auto">
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
                    <div className="py-1" role="menu">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <UserCircle size={18} />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Package size={18} />
                        <span className="text-sm font-medium">
                          Order History
                        </span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200"
                        role="menuitem"
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
                        role="menuitem"
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
                  <span className="absolute -top-1 -right-1 bg-[#5F1327] text-white text-xs px-1 py-0 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile: Phone/Email Bottom Center Row */}
          <div className="hidden  justify-center py-2">
            <div className="text-white text-xs xs:text-sm font-semibold flex items-center gap-4">
              <span>+2348187230200</span>
              <span>|</span>
              <span className="underline">info@sablle.ng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div
          ref={overlayRef}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu - Slide-in with Overflow */}
      {mobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden fixed left-0 top-[0] h-full w-80 bg-[#5F1327] text-white z-50 transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto max-h-screen"
          style={{ top: "0" }} // Align with noti bar
          role="navigation"
          aria-label="Mobile Navigation"
          aria-expanded={true}
        >
          {/* Close Button - Top Right X Icon */}
          <div className="flex justify-end p-4 border-b border-[#5F1327]/20">
            <button
              onClick={handleCloseMenu}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-[#5F1327]/20"
              aria-label="Close Menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Tags */}
          <div className="space-y-1 pt-4">
            {isLoadingTags ? (
              <div className="px-4 py-4">
                <p className="text-sm text-gray-300">Loading tags...</p>
              </div>
            ) : errorTags ? (
              <div className="px-4 py-4">
                <p className="text-sm text-red-300">Error loading tags</p>
              </div>
            ) : tags.length > 0 ? (
              tags.map((tag) => {
                const subs = getTagCategories(tag);
                return (
                  <div
                    key={tag.id}
                    className="border-t border-[#5F1327]/20 first:border-t-0"
                  >
                    <button
                      onClick={() => toggleDropdown(tag.slug)}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#5F1327]/20 transition-colors duration-200"
                      aria-expanded={activeDropdown === tag.slug}
                      role="button"
                    >
                      <span className="text-sm font-medium truncate max-w-[80%] line-clamp-1">
                        {tag.name}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          activeDropdown === tag.slug ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === tag.slug && (
                      <div className="bg-[#5F1327]/10 space-y-1 px-4 pb-3 max-h-[50vh] overflow-y-auto">
                        {/* View All - First, Actionable */}
                        <Link
                          to={`/groups/${tag.slug}`}
                          className="block py-2.5 text-sm font-semibold text-white hover:text-yellow-300 border-b border-[#5F1327]/20 truncate text-center"
                          onClick={() => {
                            setMobileMenu(false);
                            closeAllDropdowns();
                          }}
                        >
                          View All in {tag.name}
                        </Link>

                        {subs.length > 0 ? (
                          <div className="space-y-1 pt-2">
                            {subs.slice(0, 6).map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/categories/${sub.slug}`}
                                className="block py-2 text-sm text-gray-100 hover:text-white pl-4 border-l-2 border-transparent hover:border-yellow-300 transition-colors truncate"
                                onClick={() => {
                                  setMobileMenu(false);
                                  closeAllDropdowns();
                                }}
                              >
                                Shop {sub.name}
                              </Link>
                            ))}
                            {subs.length > 6 && (
                              <Link
                                to={`/groups/${tag.slug}`}
                                className="block py-2 text-sm text-gray-300 hover:text-white text-center"
                                onClick={() => {
                                  setMobileMenu(false);
                                  closeAllDropdowns();
                                }}
                              >
                                More Categories...
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="py-2 text-gray-300 text-sm text-center">
                            No categories yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4">
                <p className="text-sm text-gray-300">No tags available</p>
              </div>
            )}
          </div>
          {auth.isAuthenticated ? (
            <>
              <div className="border-t border-[#5F1327]/20 pt-2 px-4 pb-4">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenu(false);
                  }}
                  className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200 w-full text-left"
                  role="menuitem"
                >
                  <UserCircle size={18} />
                  <span className="text-sm font-medium">My Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/orders");
                    setMobileMenu(false);
                  }}
                  className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200 w-full text-left"
                  role="menuitem"
                >
                  <Package size={18} />
                  <span className="text-sm font-medium">Order History</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/wishlist");
                    setMobileMenu(false);
                  }}
                  className="flex items-center gap-3 py-2 hover:bg-[#5F1327]/20 transition-colors duration-200 w-full text-left"
                  role="menuitem"
                >
                  <Heart size={18} />
                  <span className="text-sm font-medium">My Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                    setMobileMenu(false);
                  }}
                  className="flex items-center gap-3 w-full py-2 text-red-300 hover:bg-red-900/20 transition-colors duration-200"
                  role="menuitem"
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
                role="menuitem"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Nav Links - Centered, White BG, Always Below Noti */}
      <nav
        className="bg-white md:sticky md:top-[calc(theme(spacing.10)+theme(spacing.4))] z-40 border-b border-gray-200"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex flex-wrap font-medium items-center justify-center gap-6 py-3 md:py-4">
            {isLoadingTags ? (
              <div className="space-x-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse w-20"
                  />
                ))}
              </div>
            ) : errorTags ? (
              <div className="text-sm text-red-500">
                Error loading navigation
              </div>
            ) : tags.length > 0 ? (
              tags.map((tag) => {
                const subs = getTagCategories(tag);
                return (
                  <div
                    key={tag.id}
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter(tag.slug)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={`/groups/${tag.slug}`}
                      className="flex items-center gap-1 text-gray-700 hover:text-[#5F1327] transition-colors duration-200 whitespace-nowrap"
                    >
                      {tag.name}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          activeDropdown === tag.slug ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                    {activeDropdown === tag.slug && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 bg-white shadow-lg rounded-lg py-2 border border-gray-100 opacity-100 transition-all duration-300 ease-in-out scale-100 overflow-hidden max-h-[70vh] overflow-y-auto z-50">
                        {/* View All - First, Actionable Title */}
                        <Link
                          to={`/groups/${tag.slug}`}
                          className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#5F1327] hover:text-white transition-colors duration-200 text-center border-b border-gray-100"
                        >
                          View All in {tag.name}
                        </Link>

                        {subs.length > 0 ? (
                          <div className="space-y-1 py-2">
                            {/* Rearranged: Top 6 subs (assume sorted by popularity in getTagCategories) */}
                            {subs.slice(0, 6).map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/categories/${sub.slug}`}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200 truncate"
                              >
                                Shop {sub.name.toUpperCase()}
                              </Link>
                            ))}

                            {/* If more than 6, add "More..." link */}
                            {subs.length > 6 && (
                              <Link
                                to={`/groups/${tag.slug}`}
                                className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-[#5F1327] transition-colors duration-200 text-center"
                              >
                                More Categories...
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="px-4 py-4 text-gray-500 text-sm text-center">
                            No categories available yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">No tags available</div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
});

Header.displayName = "Header"; // For React DevTools

export default Header;
