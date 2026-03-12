"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { MenuItem } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface FoodCardProps {
  item: MenuItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/auth?mode=login");
      return;
    }
    addToCart(item);
  };

  return (
    <div className="group relative mt-16 flex flex-col rounded-[32px] bg-secondary p-6 pt-24 shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover">
      {/* Absolute positioned Circular Plate Image */}
      <div className="absolute -top-16 left-6 h-40 w-40 overflow-hidden rounded-full shadow-lg transition-transform duration-500 group-hover:scale-105 border-4 border-white/50">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="160px"
        />
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="text-xs font-bold text-foreground">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col mt-2">
        <h3 className="font-serif text-xl font-bold leading-tight text-foreground line-clamp-2 mb-2">
          {item.name}
        </h3>
        
        <p className="line-clamp-2 text-sm text-foreground/60 flex-1 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between pb-2 mt-auto">
          <span className="font-sans text-2xl font-bold text-primary">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Docked Add to Cart Button to match Figma */}
      <div className="absolute bottom-0 right-0">
        <button
          onClick={handleAddToCart}
          disabled={!item.available}
          className="flex items-center gap-2 rounded-tl-3xl rounded-br-[32px] bg-primary px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
        >
          Add to Cart <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
