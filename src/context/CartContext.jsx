import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "./CartContextObject";
import { AuthContext } from "./AuthContextObject";
import { toast } from "react-toastify";

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart_items") || "[]")
  );
  const [total, setTotal] = useState(() =>
    parseFloat(localStorage.getItem("cart_total") || "0")
  );

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cart_session_id, setCartSessionId] = useState(
    localStorage.getItem("cart_session_id") || null
  );

  // ✅ CRITICAL FIX: Access auth object correctly
  const { auth } = useContext(AuthContext);

  // Debug auth state
  useEffect(() => {
    console.log("CartContext: Auth state changed:", {
      isAuthenticated: auth?.isAuthenticated,
      hasToken: !!auth?.token,
      tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
    });
  }, [auth]);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_total", String(total));
  }, [items, total]);

  // Fetch cart on mount and auth changes
  useEffect(() => {
    const fetchCart = async () => {
      // Skip if no authentication method available
      if (!auth?.isAuthenticated && !cart_session_id) {
        console.log("CartContext: No auth or session, skipping fetch");
        return;
      }

      try {
        console.log("CartContext: Fetching cart...");
        console.log("  Auth authenticated:", auth?.isAuthenticated);
        console.log("  Token exists:", !!auth?.token);
        console.log("  Session ID:", cart_session_id);

        // Build headers based on authentication method
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
        console.log("Cart fetch response status:", response.status);
        console.log("Cart fetch response data:", data);

        if (response.ok) {
          const newItemsFromApi = data.data?.items || [];

          // Merge names and images from cache
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
            "Setting cart items:",
            newItemsWithDetails.length,
            "items"
          );
          setItems(newItemsWithDetails);
          setTotal(data.data?.total || 0);

          // Store session ID for guest users
          if (!auth?.isAuthenticated && data.data?.session_id) {
            console.log("Storing session ID:", data.data.session_id);
            setCartSessionId(data.data.session_id);
            localStorage.setItem("cart_session_id", data.data.session_id);
          }
        } else {
          console.error("CartContext: API error:", data.message);
          if (response.status === 401) {
            toast.error("Session expired, please log in again");
          }
        }
      } catch (error) {
        console.error("CartContext: Fetch cart error:", error);
        toast.error("Network error while fetching cart");
      }
    };

    fetchCart();
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
      });
      console.log("Auth state:", {
        isAuthenticated: auth?.isAuthenticated,
        hasToken: !!auth?.token,
        tokenPreview: auth?.token ? auth.token.substring(0, 20) + "..." : null,
      });
      console.log("Session ID:", cart_session_id);

      // ✅ Create FormData (matching Postman's format)
      const formData = new FormData();
      formData.append("product_id", String(product.id));
      formData.append("quantity", String(product.quantity));
      formData.append("price", String(product.price));
      formData.append("color", product.color || "default");

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      // ✅ Build headers (NO Content-Type for FormData!)
      const headers = {};

      if (auth?.isAuthenticated && auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
        console.log("Using Bearer token:", auth.token.substring(0, 30) + "...");
      } else if (cart_session_id) {
        headers["X-Cart-Session"] = cart_session_id;
        console.log("Using session ID:", cart_session_id);
      } else {
        console.warn("⚠️ No authentication method available!");
        toast.error("Unable to add to cart. Please refresh the page.");
        return;
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

        // Merge product details into API response
        const newItemsWithDetails = apiItems.map((apiItem) => {
          const existingItem = items.find(
            (stateItem) => stateItem.product_id === apiItem.product_id
          );

          // If this is the newly added item, use the product data we just sent
          if (apiItem.product_id === product.id) {
            return {
              ...apiItem,
              name: product.name || product.product_name,
              image: product.image,
            };
          }

          // Otherwise preserve existing state
          return {
            ...apiItem,
            name: existingItem?.name || apiItem.product?.name,
            image: existingItem?.image || apiItem.product?.image,
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

        // Store session ID if provided (for guest users)
        if (!auth?.isAuthenticated && data.data?.cart_session_id) {
          console.log("Storing new session ID:", data.data.cart_session_id);
          setCartSessionId(data.data.cart_session_id);
          localStorage.setItem("cart_session_id", data.data.cart_session_id);
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
        // Refresh cart data
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
              name: existingItem?.name || apiItem.product?.name,
              image: existingItem?.image || apiItem.product?.image,
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
            name: existingItem?.name || apiItem.product?.name,
            image: existingItem?.image || apiItem.product?.image,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
