"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, List, ShoppingBag } from "lucide-react";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state: AuthState) => state.logout);

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] bg-[#FBF7F2] border-r border-foreground/5 flex flex-col z-40 md:flex">
      <div className="p-6 pb-4">
        <Link href="/" className="inline-block">
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">
            Foodio
            <span className="text-foreground">.</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/admin/menu-items"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
            pathname.startsWith("/admin/menu-items")
              ? "bg-primary text-white shadow-sm font-medium"
              : "text-foreground/70 hover:bg-white hover:text-foreground font-medium"
          }`}
        >
          <List className="h-4 w-4" />
          Menu Items
        </Link>
        
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
            pathname.startsWith("/admin/orders")
              ? "bg-primary text-white shadow-sm font-medium"
              : "text-foreground/70 hover:bg-white hover:text-foreground font-medium"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Orders
        </Link>
      </nav>

      <div className="p-4 border-t border-foreground/5">
        <button
          onClick={logout}
          className="cursor-pointer flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
