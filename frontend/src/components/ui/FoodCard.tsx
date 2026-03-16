"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { MenuItem } from "@/types";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useCartStore, CartState } from "@/stores/useCartStore";
import { useShallow } from "zustand/shallow";

interface FoodCardProps {
  item: MenuItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const router = useRouter();
  const { user, token } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
    }))
  );
  const addToCart = useCartStore((state: CartState) => state.addToCart);
  const isAuthenticated = !!token && !!user;
  const detailsHref = `/menu/${item.id}`;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    addToCart(item);
  };

  return (
    <div className="relative flex flex-col rounded-3xl bg-[#FFF8EE] p-5 pt-16 shadow-soft">
      <Link href={detailsHref} className="text-left">
      <div className="absolute -top-10 left-5 h-24 w-24 rounded-full bg-white shadow-sm flex items-center justify-center">
        <div className="relative h-21 w-21 overflow-hidden rounded-full">
          <Image
            src={item.image || "/placeholder.png"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="84px"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
          <h3 className="font-serif text-[17px] font-bold leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
            {item.name}
          </h3>

        <p className="line-clamp-2 text-sm text-foreground/60 leading-relaxed">
          {item.description}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>

      </Link>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAddToCart}
          disabled={!item.available}
          className="cursor-pointer flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          Add to Cart <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
