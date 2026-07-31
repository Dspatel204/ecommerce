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
    setCartData((prev) =>
      prev.some((i) => i.id === item.id) ? prev : [...prev, item]
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => setCartOpen((prev) => !prev), []);

  return (
    <CartContext.Provider
      value={{
        cartData,
        cartCount: cartData.length,
        addToCart,
        removeFromCart,
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
