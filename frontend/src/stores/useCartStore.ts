import { create } from "zustand";
import type { StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PersistOptions } from "zustand/middleware";
import toast from "react-hot-toast";
import type { CartItem, MenuItem } from "@/types";

export interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (menuItem: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

type CartPersistState = Pick<CartState, "items">;

const createCartStore: StateCreator<CartState, [], []> = (set, get) => ({
  items: [],
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  addToCart: (menuItem: MenuItem, quantity: number = 1) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (i) => i.menuItem.id === menuItem.id
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += quantity;
        return { items: newItems };
      }

      return { items: [...state.items, { menuItem, quantity }] };
    });
    toast.success(`Added ${menuItem.name} to cart`);
  },
  removeFromCart: (menuItemId: string) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== menuItemId),
    })),
  updateQuantity: (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(menuItemId);
      return;
    }

    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (i) => i.menuItem.id === menuItemId
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity = quantity;
        return { items: newItems };
      }

      return state;
    });
  },
  clearCart: () => set({ items: [] }),
});

const persistOptions: PersistOptions<CartState, CartPersistState> = {
  name: "foodio-cart",
  storage: createJSONStorage<CartPersistState>(() => localStorage),
  partialize: (state) => ({ items: state.items }),
};

export const useCartStore = create<CartState>()(
  persist(createCartStore, persistOptions)
);
