"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useCartStore, CartState } from "@/stores/useCartStore";
import type { CartItem } from "@/types";
import { useShallow } from "zustand/shallow";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
      logout: state.logout,
    }))
  );
  const { totalItems, openCart } = useCartStore(
    useShallow((state: CartState) => ({
      totalItems: state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
      openCart: state.openCart,
    }))
  );
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ADMIN";
  const displayCount = totalItems;
  const isLanding = pathname === "/";

  // Hide navbar on admin routes for a clean dashboard look
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`w-full bg-white border-b border-foreground/8 shadow-[0_1px_8px_rgba(0,0,0,0.06)] ${
        isLanding ? "font-landing text-forest" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10 py-[14px]">
        <div className="flex items-center justify-between">
          {/* Logo (Left) */}
          <div className="flex items-center w-1/4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-serif text-[19px] font-bold tracking-tight text-primary">
                <Leaf className="h-[18px] w-[18px] text-primary" />
                Foodio
                <span className="text-foreground">.</span>
              </span>
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-1 w-2/4">
            <Link
              href="/"
              className={`px-5 py-2 text-[14px] font-medium rounded-full transition-colors ${
                pathname === "/"
                  ? "border border-primary text-forest bg-primary/5"
                  : "text-foreground/60 hover:text-forest hover:bg-foreground/5"
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`px-5 py-2 text-[14px] font-medium rounded-full transition-colors ${
                pathname === "/menu"
                  ? "border border-primary text-forest bg-primary/5"
                  : "text-foreground/60 hover:text-forest hover:bg-foreground/5"
              }`}
            >
              Food Menu
            </Link>
            <Link
              href="/orders"
              className={`px-5 py-2 text-[14px] font-medium rounded-full transition-colors ${
                pathname === "/orders"
                  ? "border border-primary text-forest bg-primary/5"
                  : "text-foreground/60 hover:text-forest hover:bg-foreground/5"
              }`}
            >
              My Orders
            </Link>
          </nav>

          {/* Actions (Right) */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            <button
              onClick={openCart}
              className="cursor-pointer relative flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-forest text-[14px] font-medium transition-all hover:bg-primary/5"
            >
              <ShoppingBag className="h-[17px] w-[17px]" />
              {displayCount > 0 && (
                <span className="text-[14px] font-semibold">{displayCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="group relative flex items-center gap-3">
                <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-secondary text-primary text-[12px] font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Dropdown Menu */}
                <div
                  className="absolute right-0 top-full pt-2 w-48 transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50"
                >
                  <div className="rounded-xl bg-white p-2 shadow-hover border border-foreground/5">
                    <div className="px-3 py-2 text-sm text-foreground/60 border-b border-foreground/5 mb-1">
                      Hi, {user?.name.split(" ")[0]}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}

                    {!isAdmin && (
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/auth">
                  <Button className="h-10 rounded-full px-6 text-[14px] font-semibold bg-primary text-white hover:bg-primary/90">
                    Sign in &rarr;
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu fallback for auth */}
            {!isAuthenticated && (
              <Link href="/auth" className="sm:hidden p-2 text-foreground/80 hover:text-primary">
                <UserIcon className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
