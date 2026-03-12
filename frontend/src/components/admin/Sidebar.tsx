"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, List, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#FAF9F6] border-r border-foreground/5 flex flex-col z-40 hidden md:flex">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <span className="font-serif text-3xl font-bold tracking-tight text-primary">
            Foodio
            <span className="text-foreground">.</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        <Link
          href="/admin/menu-items"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname.startsWith("/admin/menu-items")
              ? "bg-primary text-white shadow-md shadow-primary/20 font-medium"
              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground font-medium"
          }`}
        >
          <List className="h-5 w-5" />
          Menu Items
        </Link>
        
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname.startsWith("/admin/orders")
              ? "bg-primary text-white shadow-md shadow-primary/20 font-medium"
              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground font-medium"
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          Orders
        </Link>
      </nav>

      <div className="p-4 border-t border-foreground/5">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
