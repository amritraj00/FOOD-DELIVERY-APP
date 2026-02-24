import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (food) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === food._id);
      if (existing) {
        toast.info(`${food.name} quantity updated!`);
        return prev.map((i) =>
          i._id === food._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`${food.name} added to cart!`);
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== foodId));
  };

  const updateQuantity = (foodId, delta) => {
    setCartItems((prev) => {
      const updated = prev.map((i) =>
        i._id === foodId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      );
      return updated;
    });
  };

  const clearCart = () => setCartItems([]);

  const getTotalItems = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const getTotalPrice = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
