// src/context/CartContext.jsx
import React, { useState, useContext, useEffect, useMemo } from "react";
import { CartContext } from "./CartContextObject";
import { AuthContext } from "./AuthContextObject";
import { toast } from "react-toastify";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
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

  useEffect(() => {
    const fetchCart = async () => {
      if (!auth.isAuthenticated && !cart_session_id) {
        console.log("CartContext: Skipping fetch, no auth or session_id");
        // Load from localStorage if available
        const cachedItems = JSON.parse(
          localStorage.getItem("cart_items") || "[]"
        );
        const cachedTotal = parseFloat(
          localStorage.getItem("cart_total") || "0"
        );
        setItems(cachedItems);
        setTotal(cachedTotal);
        return;
      }

      try {
        console.log("CartContext: Fetching cart with auth:", {
          isAuthenticated: auth.isAuthenticated,
          token: auth.token ? auth.token.substring(0, 20) + "..." : null,
          sessionId: cart_session_id,
        });
        const headers =
          auth.isAuthenticated && auth.token
            ? { Authorization: `Bearer ${auth.token}` }
            : { "X-Cart-Session": cart_session_id };

        const response = await fetch("https://api.sablle.ng/api/cart", {
          method: "GET",
          headers,
        });
        const data = await response.json();
        console.log(
          "CartContext: GET /api/cart response:",
          JSON.stringify(data, null, 2)
        );
        console.log("CartContext: Items to set:", data.data?.items || []);

        if (response.ok) {
          const newItems = data.data?.items || [];
          setItems(newItems);
          setTotal(data.data?.total || 0);
          // Update localStorage
          localStorage.setItem("cart_items", JSON.stringify(newItems));
          localStorage.setItem("cart_total", data.data?.total || 0);
          console.log("CartContext: Updated items state:", newItems);
          if (!auth.isAuthenticated && data.data?.session_id) {
            setCartSessionId(data.data.session_id);
            localStorage.setItem("cart_session_id", data.data.session_id);
            console.log(
              "CartContext: Set cart_session_id:",
              data.data.session_id
            );
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
          // Fallback to localStorage
          const cachedItems = JSON.parse(
            localStorage.getItem("cart_items") || "[]"
          );
          const cachedTotal = parseFloat(
            localStorage.getItem("cart_total") || "0"
          );
          setItems(cachedItems);
          setTotal(cachedTotal);
        }
      } catch (error) {
        console.error("CartContext: Fetch cart error:", error.message);
        toast.error("Network error while fetching cart");
        // Fallback to localStorage
        const cachedItems = JSON.parse(
          localStorage.getItem("cart_items") || "[]"
        );
        const cachedTotal = parseFloat(
          localStorage.getItem("cart_total") || "0"
        );
        setItems(cachedItems);
        setTotal(cachedTotal);
      }
    };

    fetchCart();
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
      console.log(
        "CartContext: POST /api/cart/add response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        toast.success(data.message || "Item added to cart successfully");
        setItems(data.data?.cart?.items || []);
        setTotal(data.data?.cart?.total || 0);
        console.log(
          "CartContext: Updated items after add:",
          data.data?.cart?.items || []
        );
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
      console.log(
        "CartContext: PATCH /api/cart/items response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        const cartResponse = await fetch("https://api.sablle.ng/api/cart", {
          method: "GET",
          headers,
        });
        const cartData = await cartResponse.json();
        console.log(
          "CartContext: GET /api/cart after update response:",
          JSON.stringify(cartData, null, 2)
        );

        if (cartResponse.ok) {
          setItems(cartData.data?.items || []);
          setTotal(cartData.data?.total || 0);
          console.log(
            "CartContext: Updated items after quantity update:",
            cartData.data?.items || []
          );
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
      console.log("CartContext: Removing item with ID:", id);
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
      console.log(
        "CartContext: DELETE /api/cart/items response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        setItems(data.data?.items || []);
        setTotal(data.data?.total || 0);
        console.log(
          "CartContext: Updated items after remove:",
          data.data?.items || []
        );
        toast.success(data.message || "Item removed successfully");
      } else {
        console.error("CartContext: Delete error:", data.message);
        if (response.status === 401) {
          toast.error("Invalid token, please log in again");
          auth.logout();
        } else {
          toast.error(data.message || "Failed to remove item from cart");
        }
        // Fallback fetch only if necessary
        try {
          const cartResponse = await fetch("https://api.sablle.ng/api/cart", {
            method: "GET",
            headers,
          });
          const cartData = await cartResponse.json();
          if (cartResponse.ok) {
            setItems(cartData.data?.items || []);
            setTotal(cartData.data?.total || 0);
            console.log(
              "CartContext: Recovered cart after delete error:",
              cartData.data?.items || []
            );
          } else {
            toast.error(cartData.message || "Failed to recover cart");
          }
        } catch (error) {
          console.error("CartContext: Recovery fetch error:", error.message);
          toast.error("Network error while recovering cart");
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
