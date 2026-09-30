import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ff_cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ff_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, color = null, size = null) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.color === color && i.size === size
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.color === color && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          image: product.mainImage,
          quantity,
          color,
          size,
          maxStock: product.stockQuantity,
          gstPercent: product.gstPercent != null ? Number(product.gstPercent) : 0
        }
      ];
    });
  };

  const removeFromCart = (productId, color, size) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.color === color && i.size === size))
    );
  };

  const updateQuantity = (productId, color, size, quantity) => {
    if (quantity < 1) return removeFromCart(productId, color, size);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.color === color && i.size === size
          ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) }
          : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalGst = cart.reduce((s, i) => {
    const line = i.price * i.quantity;
    const pct = Number(i.gstPercent) || 0;
    return s + (line * pct) / 100;
  }, 0);
  const grandTotal = totalAmount + totalGst;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        totalGst,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);