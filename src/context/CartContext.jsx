import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartData, setCartData] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((item) => {
    setCartData((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCartData((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.max(1, (i.quantity || 1) + delta) }
            : i
        )
        .filter((i) => (i.quantity || 1) > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCartData([]), []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => setCartOpen((prev) => !prev), []);

  return (
    <CartContext.Provider
      value={{
        cartData,
        cartCount: cartData.length,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
