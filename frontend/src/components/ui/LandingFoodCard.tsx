"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { LandingMenuItem } from "@/lib/landingFixtures";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useCartStore, CartState } from "@/stores/useCartStore";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

interface LandingFoodCardProps {
  item: LandingMenuItem;
}

export function LandingFoodCard({ item }: LandingFoodCardProps) {
  const router = useRouter();
  const { user, token } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
    }))
  );
  const addToCart = useCartStore((state: CartState) => state.addToCart);
  const isAuthenticated = !!token && !!user;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    addToCart(item);
  };

  return (
    <div className="relative flex h-71.25 flex-col rounded-2xl bg-[#f4f0e6] px-5 pb-5 pt-[86px]">
      <div className="absolute -top-10 left-5 flex h-30 w-30 items-center justify-center rounded-full bg-white shadow-soft">
        <div className="relative h-27 w-27 overflow-hidden rounded-full">
          <Image
            src={item.image || "/placeholder.png"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="108px"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-landing text-xl font-bold text-forest leading-snug line-clamp-2">
          {item.name}
        </h3>
        <p className="text-sm text-forest leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-forest tracking-tight">
            ${Number(item.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Add to Cart
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
