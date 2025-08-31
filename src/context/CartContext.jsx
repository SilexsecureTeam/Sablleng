import React, { useState } from "react";
import { CartContext } from "./CartContextObject";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

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
      updateQuantity(product.id, existingItem.quantity + product.quantity);
    } else {
      setItems([...items, { ...product }]);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        updateQuantity,
        removeItem,
        addItem,
        clearCart,
        selectedAddress,
        setSelectedAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
