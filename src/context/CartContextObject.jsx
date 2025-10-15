// src/context/CartContextObject.jsx
import { createContext } from "react";

export const CartContext = createContext({
  items: [],
  total: 0,
  cart_session_id: null,
  setCartSessionId: () => {}, // Add setCartSessionId
  updateQuantity: () => {},
  removeItem: () => {},
  addItem: () => {},
  setSelectedAddress: () => {},
  selectedAddress: null,
  setItems: () => {}, // Already included
  setTotal: () => {}, // Already included
});
