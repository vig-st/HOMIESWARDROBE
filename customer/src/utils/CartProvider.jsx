import { CartContext } from './CartContext';
import { useEffect, useState } from 'react';

function getSavedCart() {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem('homiesCart');
  return stored ? JSON.parse(stored) : [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getSavedCart);

  useEffect(() => {
    window.localStorage.setItem('homiesCart', JSON.stringify(items));
  }, [items]);

  function buildItem(product) {
    const itemId = `${product.id}-${product.selectedSize || 'default'}-${product.selectedColor || 'default'}`;
    return {
      ...product,
      itemId,
      selectedSize: product.selectedSize || product.sizes?.[0] || '',
      selectedColor: product.selectedColor || product.colors?.[0] || '',
      quantity: product.quantity || 1,
    };
  }

  function addToCart(product) {
    const item = buildItem(product);
    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.itemId);
      if (existing) {
        return prev.map((i) => i.itemId === existing.itemId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  }

  function removeFromCart(itemId) {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }

  function increaseQty(itemId) {
    setItems((prev) => prev.map((i) => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i));
  }

  function decreaseQty(itemId) {
    setItems((prev) => prev.map((i) => i.itemId === itemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
