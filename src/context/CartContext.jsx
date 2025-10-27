import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "./CartContextObject"; // Import context
import { AuthContext } from "./AuthContextObject";
import { toast } from "react-toastify";

export const CartProvider = ({ children }) => {
  // Initialize cart state from localStorage
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

  // Initialize wishlist state from localStorage
  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

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
  }, [items, total, cart_session_id, wishlist]);

  // Wishlist functions
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        toast.info(`${product.name} is already in your wishlist`, {
          position: "top-right",
          autoClose: 3000,
        });
        return prev;
      }
      const updatedWishlist = [...prev, product];
      toast.success(`${product.name} added to wishlist`, {
        position: "top-right",
        autoClose: 3000,
      });
      return updatedWishlist;
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => {
      const item = prev.find((item) => item.id === itemId);
      const updatedWishlist = prev.filter((item) => item.id !== itemId);
      if (item) {
        toast.success(`${item.name} removed from wishlist`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return updatedWishlist;
    });
  };

  const isInWishlist = (itemId) => {
    return wishlist.some((item) => item.id === itemId);
  };

  // Existing cart fetch logic
  useEffect(() => {
    const fetchCart = async () => {
      if (!auth?.isAuthenticated && !cart_session_id) {
        console.log("🛒 CartContext: No auth or session, skipping fetch.");
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
      }
    };

    fetchCart();
  }, [auth?.isAuthenticated, auth?.token, cart_session_id]);

  // Existing cart merge logic
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

  const addItem = async (product) => {
    try {
      console.log("\n=== ADD TO CART REQUEST ===");
      console.log("Product to add:", {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        color: product.color,
        size: product.size, // Log size
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
      formData.append("size", product.size || "N/A"); // Add size to FormData

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
              color: product.color || "default", // Include color
              size: product.size || "N/A", // Include size
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
            color: existingItem?.color || apiItem.color || "default", // Preserve color
            size: existingItem?.size || apiItem.size || "N/A", // Preserve size
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
