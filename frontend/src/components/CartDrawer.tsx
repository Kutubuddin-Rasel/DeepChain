"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore, CartState } from "@/stores/useCartStore";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import type { CartItem } from "@/types";
import { useShallow } from "zustand/shallow";
import axios from "axios";
import { ordersService } from "@/services/orders.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, clearCart } = useCartStore(
    useShallow((state: CartState) => ({
      isCartOpen: state.isCartOpen,
      closeCart: state.closeCart,
      items: state.items,
      updateQuantity: state.updateQuantity,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
    }))
  );
  const totalPrice = useMemo(
    () => items.reduce((sum: number, item: CartItem) => sum + item.menuItem.price * item.quantity, 0),
    [items]
  );
  const { user, token } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
    }))
  );
  const isAuthenticated = !!token && !!user;
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [address, setAddress] = useState("");

  // Initialize address once user is loaded
  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address);
    }
  }, [user, address]);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      closeCart();
      router.push("/auth?mode=login");
      return;
    }

    if (!address.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    try {
      await ordersService.createOrder({
        address,
        items: items.map((item: CartItem) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
      });
      
      toast.success("Order placed successfully!");
      clearCart();
      closeCart();
      router.push("/orders");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to place order.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error(error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/5 p-6 bg-white">
          <div className="flex items-center gap-3 text-foreground font-serif text-2xl font-bold">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Your Cart
          </div>
          <button 
            onClick={closeCart}
            className="cursor-pointer rounded-full p-2 text-foreground/40 hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-secondary/30">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-foreground/40">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <Button onClick={closeCart} variant="outline" className="mt-6 rounded-full">
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item: CartItem) => (
                <div key={item.menuItem.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-foreground/5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-foreground/5 bg-secondary">
                    <Image
                      src={item.menuItem.image || "/placeholder.png"}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-foreground line-clamp-1">{item.menuItem.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="cursor-pointer text-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-primary">
                        ${Number(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                      
                      <div className="flex items-center gap-3 rounded-full bg-secondary px-3 py-1">
                        <button 
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="cursor-pointer text-foreground hover:text-primary transition-colors disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center select-none">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="cursor-pointer text-foreground hover:text-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-foreground/5 bg-white p-6 pb-8">
            <div className="mb-6 space-y-4">
              {isAuthenticated && (
                <div className="rounded-2xl bg-secondary/50 p-4 border border-foreground/5">
                  <Input
                    label="Delivery Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    className="bg-white border-transparent shadow-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-foreground">Subtotal</span>
                <span className="text-primary font-sans text-2xl">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={handlePlaceOrder} 
              isLoading={isPlacingOrder}
              disabled={items.length === 0}
              className="w-full rounded-full h-14 text-base gap-2 group shadow-lg shadow-primary/20"
            >
              Place Order 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
