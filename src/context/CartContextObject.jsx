import { createContext } from "react";

export const CartContext = createContext({
  items: [],
  total: 0,
  cart_session_id: null,
  setCartSessionId: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  addItem: () => {},
  setSelectedAddress: () => {},
  selectedAddress: null,
  setItems: () => {},
  setTotal: () => {},
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => {},
});
