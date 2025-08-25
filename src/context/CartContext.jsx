import React, { useState } from "react";
import { CartContext } from "./CartContextObject";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addItem = (product) => {
    const existingItem = items.find((item) => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  return (
    <CartContext.Provider
      value={{ items, updateQuantity, removeItem, addItem }}
    >
      {children}
    </CartContext.Provider>
  );
};
