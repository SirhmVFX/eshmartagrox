"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type CartItem = { id: string; name: string; price: number; quantity: number };

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ea_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ea_cart", JSON.stringify(items));
    } catch (e) {}
    // expose simple API for legacy pages/components
    try {
      // @ts-ignore
      window.__ea_cart_ref = { add, remove, clear, count: items.reduce((s, it) => s + it.quantity, 0) };
    } catch (e) {}
  }, [items]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p));
      return [...prev, item];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, it) => s + it.quantity, 0);
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export type { CartItem };
