"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { menuService } from "@/services/menu.service";
import type { MenuItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useCartStore, CartState } from "@/stores/useCartStore";
import { useShallow } from "zustand/shallow";

export default function MenuItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { user, token } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
    }))
  );
  const addToCart = useCartStore((state: CartState) => state.addToCart);
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const res = await menuService.getById(id);
        setItem(res);
      } catch (error) {
        console.error("Failed to fetch menu item", error);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/menu/${item.id}`);
      router.push(`/auth?mode=login&redirect=${redirect}`);
      return;
    }
    addToCart(item, quantity);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 99) return 99;
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative h-[420px] w-full rounded-[32px] bg-secondary animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 rounded-xl bg-secondary animate-pulse" />
            <div className="h-5 w-full rounded-xl bg-secondary animate-pulse" />
            <div className="h-5 w-5/6 rounded-xl bg-secondary animate-pulse" />
            <div className="h-12 w-1/3 rounded-xl bg-secondary animate-pulse" />
            <div className="h-14 w-1/2 rounded-2xl bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center flex-1">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Item not found</h1>
        <p className="text-foreground/60 mb-8">We couldn&apos;t locate this dish. It might have been removed.</p>
        <Link href="/menu">
          <Button variant="outline">Back to Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
      <div className="mb-8">
        <Link href="/menu" className="text-sm font-semibold text-primary hover:text-primary-hover">
          &larr; Back to Menu
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 items-start">
        <div className="relative overflow-hidden rounded-[32px] bg-secondary shadow-soft">
          <div className="relative h-[420px] w-full">
            <Image
              src={item.image || "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {!item.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-foreground">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {item.category?.name && (
              <span className="rounded-full bg-secondary px-4 py-1 text-xs font-semibold text-foreground/70">
                {item.category.name}
              </span>
            )}
            <span className={`rounded-full px-4 py-1 text-xs font-semibold ${
              item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {item.available ? "Available" : "Unavailable"}
            </span>
          </div>

          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">{item.name}</h1>
            <p className="text-foreground/70 leading-relaxed">{item.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">${Number(item.price).toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-white px-4 py-2 shadow-sm">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[24px] text-center font-semibold text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="rounded-full px-8"
              onClick={handleAddToCart}
              disabled={!item.available}
            >
              Add to Cart
              <ShoppingCart className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-foreground/50">
              Please sign in to add items to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
