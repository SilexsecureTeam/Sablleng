// src/context/CartContext.jsx
import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { CartContext } from "./CartContextObject";
import { AuthContext } from "./AuthContextObject";
import { useLocation } from "react-router-dom";

export const CartProvider = ({ children }) => {
  const location = useLocation();
  // Cart state
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart_items") || "[]")
  );
  const [total, setTotal] = useState(() =>
    parseFloat(localStorage.getItem("cart_total") || "0")
  );
  const [cart_session_id, setCartSessionId] = useState(
    localStorage.getItem("cart_session_id") || null
  );
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );
  const [wishlist_session_id, setWishlistSessionId] = useState(
    localStorage.getItem("wishlist_session_id") || null
  );
  const [isLoading, setIsLoading] = useState(true);

  const { auth } = useContext(AuthContext);

  // Debug auth state
  useEffect(() => {
    console.log("🛒 CartContext: Auth state changed:", {
      isAuthenticated: auth?.isAuthenticated,
      hasToken: !!auth?.token,
      tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
    });
  }, [auth]);

  // Sync cart and wishlist with localStorage
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_total", String(total));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    if (cart_session_id) {
      localStorage.setItem("cart_session_id", cart_session_id);
    }
    if (wishlist_session_id) {
      localStorage.setItem("wishlist_session_id", wishlist_session_id);
    }
  }, [items, total, cart_session_id, wishlist, wishlist_session_id]);

  // Fetch wishlist from API
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth?.isAuthenticated && !wishlist_session_id) {
        console.log(
          "🛒 CartContext: No auth or wishlist session, skipping fetch."
        );
        setIsLoading(false);
        return;
      }

      try {
        console.log("🛒 CartContext: Fetching wishlist...");
        console.log("  Authenticated:", auth?.isAuthenticated);
        console.log("  Token exists:", !!auth?.token);
        console.log("  Wishlist Session ID:", wishlist_session_id);

        const headers = {};
        if (auth?.isAuthenticated && auth?.token) {
          headers["Authorization"] = `Bearer ${auth.token}`;
          console.log("  Using Bearer token authentication");
        } else if (wishlist_session_id) {
          headers["X-Cart-Session"] = wishlist_session_id;
          console.log("  Using wishlist session authentication");
        }

        const response = await fetch("https://api.sablle.ng/api/wishlist", {
          method: "GET",
          headers,
        });

        const data = await response.json();
        console.log("🛒 Wishlist fetch response status:", response.status);
        console.log("🛒 Wishlist fetch response data:", data);

        if (response.ok) {
          // FIXED: Use data.wishlist per Postman, not data.data
          const wishlistItems = Array.isArray(data.wishlist)
            ? data.wishlist
            : [];
          const formattedWishlist = wishlistItems.map((item) => ({
            id: item.product_id,
            name: item.product?.name || item.name || "Unknown Product",
            price: item.product?.sale_price_inc_tax
              ? `₦${parseFloat(
                  item.product.sale_price_inc_tax
                ).toLocaleString()}`
              : item.price || "Price Unavailable",
            category:
              item.product?.category?.name ||
              item.category ||
              "Unknown Category",
            badge: item.product?.customize
              ? "Customizable"
              : item.badge || null,
            image:
              item.product?.images?.[0] ||
              item.image ||
              "/placeholder-image.jpg",
            customize:
              item.product?.meta?.customizable ??
              item.product?.customize ??
              item.customize ??
              false,
          }));

          setWishlist(formattedWishlist);
          if (!auth?.isAuthenticated && data.session_id) {
            setWishlistSessionId(data.session_id);
            localStorage.setItem("wishlist_session_id", data.session_id);
          }
          toast.success(
            `Wishlist loaded with ${formattedWishlist.length} items`,
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        } else {
          console.error("❌ CartContext: Wishlist API error:", data.message);
          if (response.status === 401) {
            toast.error("Wishlist session expired, please add items again");
            setWishlistSessionId(null);
            localStorage.removeItem("wishlist_session_id");
          }
        }
      } catch (error) {
        console.error("❌ CartContext: Fetch wishlist error:", error);
        toast.error("Network error while fetching wishlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [auth?.isAuthenticated, auth?.token, wishlist_session_id]);

  // Wishlist merge on login
  useEffect(() => {
    const handleWishlistMergeOnLogin = async () => {
      if (
        auth?.isAuthenticated &&
        auth?.token &&
        wishlist_session_id &&
        !localStorage.getItem("wishlist_merged") &&
        location.pathname !== "/signin" && // FIXED: Skip on signin
        location.pathname !== "/signup" // Optional: Add other login routes
      ) {
        console.log("🛒 CartContext: Merging wishlist on login...");
        try {
          const formData = new FormData();
          formData.append("session_id", wishlist_session_id);

          const response = await fetch(
            "https://api.sablle.ng/api/wishlist/merge",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
              body: formData,
            }
          );

          const data = await response.json();
          if (response.ok) {
            toast.success("Wishlist merged successfully!");
            // FIXED: Assume merge returns data.data; adjust if it's data.wishlist
            const wishlistItems = Array.isArray(data.data) ? data.data : [];
            const formattedWishlist = wishlistItems.map((item) => ({
              id: item.product_id,
              name: item.product?.name || item.name || "Unknown Product",
              price: item.product?.sale_price_inc_tax
                ? `₦${parseFloat(
                    item.product.sale_price_inc_tax
                  ).toLocaleString()}`
                : item.price || "Price Unavailable",
              category:
                item.product?.category?.name ||
                item.category ||
                "Unknown Category",
              badge: item.product?.customize
                ? "Customizable"
                : item.badge || null,
              image:
                item.product?.images?.[0] ||
                item.image ||
                "/placeholder-image.jpg",
              customize:
                item.product?.meta?.customizable ??
                item.product?.customize ??
                item.customize ??
                false,
            }));

            setWishlist(formattedWishlist);
            setWishlistSessionId(null);
            localStorage.removeItem("wishlist_session_id");
            localStorage.setItem("wishlist_merged", "true");
          } else {
            console.error("❌ Wishlist merge failed:", data);
            toast.error(data.message || "Failed to merge wishlist");
          }
        } catch (error) {
          console.error("❌ Wishlist merge error:", error);
          toast.error("Network error during wishlist merge");
        }
      }
    };

    handleWishlistMergeOnLogin();
  }, [
    auth?.isAuthenticated,
    auth?.token,
    wishlist_session_id,
    location.pathname,
  ]); // ADD: location.pathname to deps (runs only when route changes too)

  // Wishlist functions
  const addToWishlist = async (product) => {
    try {
      console.log("🛒 Adding to wishlist:", product);
      const formData = new FormData();
      formData.append("product_id", String(product.id));

      const headers = {};
      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      } else if (wishlist_session_id) {
        headers["X-Cart-Session"] = wishlist_session_id;
      }

      const response = await fetch("https://api.sablle.ng/api/wishlist", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();
      console.log("🛒 Wishlist add response:", data);

      if (response.ok) {
        toast.success(data.message || `${product.name} added to wishlist`, {
          position: "top-right",
          autoClose: 3000,
        });

        // FIXED: Store new session_id IMMEDIATELY if provided (for guests)
        if (!auth?.isAuthenticated && data.session_id) {
          console.log("🛒 New session_id from add:", data.session_id);
          setWishlistSessionId(data.session_id);
          localStorage.setItem("wishlist_session_id", data.session_id);
        }

        // NOW fetch updated with potentially new headers/session_id
        const updatedHeaders = {};
        if (auth?.isAuthenticated && auth?.token) {
          updatedHeaders["Authorization"] = `Bearer ${auth.token}`;
        } else if (wishlist_session_id || data.session_id) {
          // Use new one if set
          updatedHeaders["X-Cart-Session"] =
            data.session_id || wishlist_session_id;
        }

        const wishlistResponse = await fetch(
          "https://api.sablle.ng/api/wishlist",
          {
            method: "GET",
            headers: updatedHeaders, // Use fresh headers
          }
        );
        const wishlistData = await wishlistResponse.json();

        if (wishlistResponse.ok) {
          // FIXED: Use data.wishlist per Postman
          const wishlistItems = Array.isArray(wishlistData.wishlist)
            ? wishlistData.wishlist
            : [];
          const formattedWishlist = wishlistItems.map((item) => ({
            id: item.product_id,
            name: item.product?.name || product.name || "Unknown Product",
            price: item.product?.sale_price_inc_tax
              ? `₦${parseFloat(
                  item.product.sale_price_inc_tax
                ).toLocaleString()}`
              : product.price || "Price Unavailable",
            category:
              item.product?.category?.name ||
              product.category ||
              "Unknown Category",
            badge: item.product?.customize
              ? "Customizable"
              : product.badge || null,
            image:
              item.product?.images?.[0] ||
              product.image ||
              "/placeholder-image.jpg",
            customize:
              item.product?.meta?.customizable ??
              item.product?.customize ??
              product.customize ??
              false,
          }));

          setWishlist(formattedWishlist);
          console.log("🛒 Updated wishlist length:", formattedWishlist.length);
        } else {
          toast.error("Failed to fetch updated wishlist");
        }
      } else {
        if (response.status === 401) {
          toast.error("Session expired, please log in or try again");
          setWishlistSessionId(null);
          localStorage.removeItem("wishlist_session_id");
        } else {
          toast.error(data.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("❌ Wishlist add error:", error);
      toast.error("Network error while adding to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const headers = {};
      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      } else if (wishlist_session_id) {
        headers["X-Cart-Session"] = wishlist_session_id;
      } else {
        toast.error("No active wishlist session. Please try again.");
        return;
      }

      const response = await fetch(
        `https://api.sablle.ng/api/wishlist/${productId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();
      console.log("🛒 Wishlist remove response:", data);

      if (response.ok) {
        toast.success(data.message || "Item removed from wishlist", {
          position: "top-right",
          autoClose: 3000,
        });

        // Fetch updated wishlist
        const wishlistResponse = await fetch(
          "https://api.sablle.ng/api/wishlist",
          {
            method: "GET",
            headers,
          }
        );
        const wishlistData = await wishlistResponse.json();

        if (wishlistResponse.ok) {
          // FIXED: Use data.wishlist per Postman
          const wishlistItems = Array.isArray(wishlistData.wishlist)
            ? wishlistData.wishlist
            : [];
          const formattedWishlist = wishlistItems.map((item) => ({
            id: item.product_id,
            name: item.product?.name || item.name || "Unknown Product",
            price: item.product?.sale_price_inc_tax
              ? `₦${parseFloat(
                  item.product.sale_price_inc_tax
                ).toLocaleString()}`
              : item.price || "Price Unavailable",
            category:
              item.product?.category?.name ||
              item.category ||
              "Unknown Category",
            badge: item.product?.customize
              ? "Customizable"
              : item.badge || null,
            image:
              item.product?.images?.[0] ||
              item.image ||
              "/placeholder-image.jpg",
            customize:
              item.product?.meta?.customizable ??
              item.product?.customize ??
              item.customize ??
              false,
          }));

          setWishlist(formattedWishlist);
        } else {
          toast.error("Failed to fetch updated wishlist");
        }
      } else {
        if (response.status === 401) {
          toast.error("Session expired, please log in or try again");
          setWishlistSessionId(null);
          localStorage.removeItem("wishlist_session_id");
        } else {
          toast.error(data.message || "Failed to remove from wishlist");
        }
      }
    } catch (error) {
      console.error("❌ Wishlist remove error:", error);
      toast.error("Network error while removing from wishlist");
    }
  };

  const isInWishlist = (itemId) => {
    return wishlist.some((item) => item.id === itemId);
  };

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      if (!auth?.isAuthenticated && !cart_session_id) {
        console.log("🛒 CartContext: No auth or session, skipping fetch.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🛒 CartContext: Fetching cart...");
        console.log("  Authenticated:", auth?.isAuthenticated);
        console.log("  Token exists:", !!auth?.token);
        console.log("  Session ID:", cart_session_id);

        const headers = {};
        if (auth?.isAuthenticated && auth?.token) {
          headers["Authorization"] = `Bearer ${auth.token}`;
          console.log("  Using Bearer token authentication");
        } else if (cart_session_id) {
          headers["X-Cart-Session"] = cart_session_id;
          console.log("  Using session authentication");
        }

        const response = await fetch("https://api.sablle.ng/api/cart", {
          method: "GET",
          headers,
        });

        const data = await response.json();
        console.log("🛒 Cart fetch response status:", response.status);
        console.log("🛒 Cart fetch response data:", data);

        if (response.ok) {
          const newItemsFromApi = data.data?.items || [];
          const newItemsWithDetails = newItemsFromApi.map((apiItem) => {
            const cachedItem = items.find(
              (cache) => cache.product_id === apiItem.product_id
            );
            return {
              ...apiItem,
              name:
                cachedItem?.name || apiItem.product?.name || "Unknown Product",
              image:
                cachedItem?.image ||
                apiItem.product?.image ||
                "/placeholder-image.jpg",
            };
          });

          console.log(
            "✅ Setting cart items:",
            newItemsWithDetails.length,
            "items"
          );
          setItems(newItemsWithDetails);
          setTotal(data.data?.total || 0);

          if (!auth?.isAuthenticated && data.data?.session_id) {
            const newSessionId = data.data.session_id;
            if (newSessionId !== cart_session_id) {
              console.log("✅ Updating session ID:", newSessionId);
              setCartSessionId(newSessionId);
              localStorage.setItem("cart_session_id", newSessionId);
            }
          }
        } else {
          console.error("❌ CartContext: API error:", data.message);
          if (response.status === 401) {
            toast.error("Session expired, please log in again");
          }
        }
      } catch (error) {
        console.error("❌ CartContext: Fetch cart error:", error);
        toast.error("Network error while fetching cart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [auth?.isAuthenticated, auth?.token, cart_session_id]);

  // Cart merge on login
  useEffect(() => {
    const handleMergeOnLogin = async () => {
      if (
        auth?.isAuthenticated &&
        auth?.token &&
        cart_session_id &&
        !localStorage.getItem("cart_merged")
      ) {
        console.log(
          "🛒 CartContext: Detected login with guest session. Merging cart..."
        );
        console.log("  Old session ID:", cart_session_id);

        try {
          const formData = new FormData();
          formData.append("session_id", cart_session_id);

          const response = await fetch("https://api.sablle.ng/api/cart/merge", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
            body: formData,
          });

          const data = await response.json();
          console.log("🛒 Merge response status:", response.status);
          console.log("🛒 Merge response data:", data);

          if (response.ok) {
            toast.success(
              "Cart merged successfully! All your items are now saved."
            );
            const mergedItems = data.data?.items || [];
            const newItemsWithDetails = mergedItems.map((apiItem) => {
              const existingItem = items.find(
                (stateItem) => stateItem.product_id === apiItem.product_id
              );
              return {
                ...apiItem,
                name:
                  existingItem?.name ||
                  apiItem.product?.name ||
                  "Unknown Product",
                image:
                  existingItem?.image ||
                  apiItem.product?.image ||
                  "/placeholder-image.jpg",
              };
            });

            setItems(newItemsWithDetails);
            setTotal(data.data?.total || 0);

            setCartSessionId(null);
            localStorage.removeItem("cart_session_id");
            localStorage.setItem("cart_merged", "true");

            console.log(
              "✅ Merge successful. Cart now has",
              newItemsWithDetails.length,
              "items."
            );
          } else {
            console.error("❌ Merge failed:", data);
            if (response.status === 401) {
              toast.error(
                "Authentication issue during merge. Please try adding items again."
              );
            } else {
              toast.error(
                data.message || "Failed to merge cart. Items preserved locally."
              );
            }
          }
        } catch (error) {
          console.error("❌ CartContext: Merge error:", error);
          toast.error(
            "Network error during cart merge. Items preserved locally."
          );
        }
      } else if (auth?.isAuthenticated) {
        console.log("🛒 CartContext: Logged in, no guest session to merge.");
        localStorage.removeItem("cart_merged");
      }
    };

    handleMergeOnLogin();
  }, [auth?.isAuthenticated, auth?.token, cart_session_id]);

  // Cart functions (unchanged)
  const addItem = async (product) => {
    try {
      console.log("\n=== ADD TO CART REQUEST ===");
      console.log("Product to add:", {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        color: product.color,
        size: product.size,
      });
      console.log("Auth state:", {
        isAuthenticated: auth?.isAuthenticated,
        hasToken: !!auth?.token,
        tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
      });
      console.log("Session ID:", cart_session_id);

      const formData = new FormData();
      formData.append("product_id", String(product.id));
      formData.append("quantity", String(product.quantity));
      formData.append("price", String(product.price));
      formData.append("color", product.color || "default");
      formData.append("size", product.size || "N/A");

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      const headers = {};
      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
        console.log("Using Bearer token:", auth.token.substring(0, 30) + "...");
      } else if (cart_session_id) {
        headers["X-Cart-Session"] = cart_session_id;
        console.log("Using session ID:", cart_session_id);
      } else {
        console.log("🛒 Guest add: No session ID, letting API create one.");
      }

      console.log("Request headers:", Object.keys(headers));

      const response = await fetch("https://api.sablle.ng/api/cart/add", {
        method: "POST",
        headers: headers,
        body: formData,
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.ok) {
        toast.success(data.message || "Item added to cart successfully");
        const apiItems = data.data?.cart?.items || [];

        const newItemsWithDetails = apiItems.map((apiItem) => {
          const existingItem = items.find(
            (stateItem) => stateItem.product_id === apiItem.product_id
          );
          if (apiItem.product_id === product.id) {
            return {
              ...apiItem,
              name: product.name || product.product_name,
              image: product.image || "/placeholder-image.jpg",
              color: product.color || "default",
              size: product.size || "N/A",
            };
          }
          return {
            ...apiItem,
            name:
              existingItem?.name || apiItem.product?.name || "Unknown Product",
            image:
              existingItem?.image ||
              apiItem.product?.image ||
              "/placeholder-image.jpg",
            color: existingItem?.color || apiItem.color || "default",
            size: existingItem?.size || apiItem.size || "N/A",
          };
        });

        console.log(
          "✅ Cart updated with",
          newItemsWithDetails.length,
          "items"
        );
        console.log("New total:", data.data?.cart?.total);

        setItems(newItemsWithDetails);
        setTotal(data.data?.cart?.total || 0);

        if (!auth?.isAuthenticated && data.cart_session_id) {
          console.log("✅ Storing new session ID:", data.cart_session_id);
          setCartSessionId(data.cart_session_id);
          localStorage.setItem("cart_session_id", data.cart_session_id);
        }
      } else {
        console.error("❌ API Error:", data);
        if (response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(
            data.message ||
              `Failed to add item. Server responded with ${response.status}`
          );
        }
      }
    } catch (error) {
      console.error("❌ CartContext: Add item error:", error);
      toast.error("Network error while adding item to cart");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const headers = {};
      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      } else if (cart_session_id) {
        headers["X-Cart-Session"] = cart_session_id;
      } else {
        toast.error("No active cart session. Please add an item first.");
        return;
      }

      const response = await fetch(
        `https://api.sablle.ng/api/cart/items/${id}?quantity=${newQuantity}`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (response.ok) {
        const cartResponse = await fetch("https://api.sablle.ng/api/cart", {
          method: "GET",
          headers,
        });
        const cartData = await cartResponse.json();

        if (cartResponse.ok) {
          const apiItems = cartData.data?.items || [];
          const newItemsWithDetails = apiItems.map((apiItem) => {
            const existingItem = items.find(
              (stateItem) => stateItem.product_id === apiItem.product_id
            );
            return {
              ...apiItem,
              name:
                existingItem?.name ||
                apiItem.product?.name ||
                "Unknown Product",
              image:
                existingItem?.image ||
                apiItem.product?.image ||
                "/placeholder-image.jpg",
            };
          });

          setItems(newItemsWithDetails);
          setTotal(cartData.data?.total || 0);
          toast.success("Quantity updated successfully");
        }
      } else {
        if (response.status === 401) {
          toast.error("Session expired, please log in again");
        } else {
          toast.error(data.message || "Failed to update quantity");
        }
      }
    } catch (error) {
      console.error("CartContext: Update quantity error:", error);
      toast.error("Network error while updating quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      const headers = {};
      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      } else if (cart_session_id) {
        headers["X-Cart-Session"] = cart_session_id;
      } else {
        toast.error("No active cart session. Please add an item first.");
        return;
      }

      const response = await fetch(
        `https://api.sablle.ng/api/cart/items/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (response.ok) {
        const apiItems = data.data?.items || [];
        const newItemsWithDetails = apiItems.map((apiItem) => {
          const existingItem = items.find(
            (stateItem) => stateItem.product_id === apiItem.product_id
          );
          return {
            ...apiItem,
            name:
              existingItem?.name || apiItem.product?.name || "Unknown Product",
            image:
              existingItem?.image ||
              apiItem.product?.image ||
              "/placeholder-image.jpg",
          };
        });

        setItems(newItemsWithDetails);
        setTotal(data.data?.total || 0);
        toast.success(data.message || "Item removed successfully");
      } else {
        if (response.status === 401) {
          toast.error("Session expired, please log in again");
        } else {
          toast.error(data.message || "Failed to remove item from cart");
        }
      }
    } catch (error) {
      console.error("CartContext: Remove item error:", error);
      toast.error("Network error while removing item");
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        cart_session_id,
        setCartSessionId,
        updateQuantity,
        removeItem,
        addItem,
        selectedAddress,
        setSelectedAddress,
        setItems,
        setTotal,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlist_session_id,
        setWishlistSessionId,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
