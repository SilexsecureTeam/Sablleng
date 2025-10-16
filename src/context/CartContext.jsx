import React, { useState, useContext, useEffect, useMemo } from "react";
import { CartContext } from "./CartContextObject";
import { AuthContext } from "./AuthContextObject";
import { toast } from "react-toastify";

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage to prevent flicker on load
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
  const authContext = useContext(AuthContext);
  const auth = useMemo(
    () =>
      authContext || { isAuthenticated: false, token: null, logout: () => {} },
    [authContext]
  );

  // useEffect to automatically sync state with localStorage
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_total", String(total));
  }, [items, total]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!auth.isAuthenticated && !cart_session_id) {
        console.log("CartContext: Skipping fetch, using cached cart");
        return;
      }

      try {
        console.log("CartContext: Fetching cart...");
        const headers =
          auth.isAuthenticated && auth.token
            ? { Authorization: `Bearer ${auth.token}` }
            : { "X-Cart-Session": cart_session_id };

        const response = await fetch("https://api.sablle.ng/api/cart", {
          method: "GET",
          headers,
        });
        const data = await response.json();

        if (response.ok) {
          const newItemsFromApi = data.data?.items || [];

          const cachedItems = items;

          // Merge names and images from cache into the fresh data from the API
          const newItemsWithDetails = newItemsFromApi.map((apiItem) => {
            const cachedItem = cachedItems.find(
              (cache) => cache.id === apiItem.id
            );
            return {
              ...apiItem,
              name: cachedItem?.name,
              image: cachedItem?.image,
            };
          });

          setItems(newItemsWithDetails);
          setTotal(data.data?.total || 0);

          if (!auth.isAuthenticated && data.data?.session_id) {
            setCartSessionId(data.data.session_id);
            localStorage.setItem("cart_session_id", data.data.session_id);
          }
          toast.success("Cart loaded successfully");
        } else {
          console.log("CartContext: API error:", data.message);
          if (response.status === 401) {
            toast.error("Invalid token, please log in again");
            auth.logout();
          } else {
            toast.error(data.message || "Failed to fetch cart");
          }
        }
      } catch (error) {
        console.error("CartContext: Fetch cart error:", error.message);
        toast.error("Network error while fetching cart");
      }
    };

    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.token, cart_session_id]);

  const addItem = async (product) => {
    try {
      const headers =
        auth.isAuthenticated && auth.token
          ? {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            }
          : {
              "X-Cart-Session": cart_session_id,
              "Content-Type": "application/json",
            };

      const response = await fetch("https://api.sablle.ng/api/cart/add", {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
          color: product.color || "default",
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Item added to cart successfully");
        const apiItems = data.data?.cart?.items || [];

        // FIX: Merge name AND image into the new cart items
        const newItemsWithDetails = apiItems.map((apiItem) => {
          const existingItem = items.find(
            (stateItem) => stateItem.id === apiItem.id
          );

          // If this is the item we just added, grab details from the 'product' object
          if (apiItem.product_id === product.id) {
            return {
              ...apiItem,
              name: product.name || product.product_name,
              image: product.image,
            };
          }
          // Otherwise, preserve the details from the existing state
          return {
            ...apiItem,
            name: existingItem?.name,
            image: existingItem?.image,
          };
        });

        setItems(newItemsWithDetails);
        setTotal(data.data?.cart?.total || 0);

        if (!auth.isAuthenticated && data.data?.cart_session_id) {
          setCartSessionId(data.data.cart_session_id);
          localStorage.setItem("cart_session_id", data.data.cart_session_id);
        }
      } else {
        if (response.status === 401) {
          toast.error("Invalid token, please log in again");
          auth.logout();
        } else {
          toast.error(data.message || "Failed to add item to cart");
        }
      }
    } catch (error) {
      console.error("CartContext: Add item error:", error.message);
      toast.error("Network error while adding item to cart");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const headers =
        auth.isAuthenticated && auth.token
          ? { Authorization: `Bearer ${auth.token}` }
          : { "X-Cart-Session": cart_session_id };

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
          // Preserve details from the current state
          const newItemsWithDetails = apiItems.map((apiItem) => {
            const existingItem = items.find(
              (stateItem) => stateItem.id === apiItem.id
            );
            return {
              ...apiItem,
              name: existingItem?.name,
              image: existingItem?.image,
            };
          });

          setItems(newItemsWithDetails);
          setTotal(cartData.data?.total || 0);
          toast.success("Quantity updated successfully");
        } else {
          if (cartResponse.status === 401) {
            toast.error("Invalid token, please log in again");
            auth.logout();
          } else {
            toast.error(cartData.message || "Failed to refresh cart");
          }
        }
      } else {
        if (response.status === 401) {
          toast.error("Invalid token, please log in again");
          auth.logout();
        } else {
          toast.error(data.message || "Failed to update quantity");
        }
      }
    } catch (error) {
      console.error("CartContext: Update quantity error:", error.message);
      toast.error("Network error while updating quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      const headers =
        auth.isAuthenticated && auth.token
          ? { Authorization: `Bearer ${auth.token}` }
          : { "X-Cart-Session": cart_session_id };

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
        // Preserve details from the current state
        const newItemsWithDetails = apiItems.map((apiItem) => {
          const existingItem = items.find(
            (stateItem) => stateItem.id === apiItem.id
          );
          return {
            ...apiItem,
            name: existingItem?.name,
            image: existingItem?.image,
          };
        });

        setItems(newItemsWithDetails);
        setTotal(data.data?.total || 0);
        toast.success(data.message || "Item removed successfully");
      } else {
        console.error("CartContext: Delete error:", data.message);
        if (response.status === 401) {
          toast.error("Invalid token, please log in again");
          auth.logout();
        } else {
          toast.error(data.message || "Failed to remove item from cart");
        }
      }
    } catch (error) {
      console.error("CartContext: Remove item error:", error.message);
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
