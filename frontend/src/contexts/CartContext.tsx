"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MenuItem, CartItem } from "@/types";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  addToCart: (menuItem: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem("foodio-cart");
    if (storedCart) {
      try {
        // eslint-disable-next-line
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
    setIsMounted(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("foodio-cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (menuItem: MenuItem, quantity = 1) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.menuItem.id === menuItem.id
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { menuItem, quantity }];
    });
    toast.success(`Added ${menuItem.name} to cart`);
  };

  const removeFromCart = (menuItemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.menuItem.id === menuItemId
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity = quantity;
        return newItems;
      }

      return prevItems;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
