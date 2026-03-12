"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  // Hide navbar on admin routes for a clean dashboard look
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo (Left) */}
          <div className="flex items-center w-1/4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                Foodio
                <span className="text-foreground">.</span>
              </span>
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-2 w-2/4">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                pathname === "/" 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                pathname === "/menu" 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              Food Menu
            </Link>
            <Link
              href="/orders"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                pathname === "/orders" 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              My Orders
            </Link>
          </nav>

          {/* Actions (Right) */}
          <div className="flex items-center justify-end gap-4 w-1/4">
            <button 
              onClick={openCart} 
              className="relative flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1.5 text-foreground hover:border-foreground/40 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-bold">{totalItems > 0 ? totalItems : ""}</span>
            </button>

            {isAuthenticated ? (
              <div className="group relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl bg-white p-2 shadow-hover border border-foreground/5 group-hover:block transition-all">
                  <div className="px-3 py-2 text-sm text-foreground/60 border-b border-foreground/5 mb-1">
                    Hi, {user?.name.split(' ')[0]}
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
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/auth">
                  <Button className="rounded-full px-6 bg-primary text-white hover:bg-primary/90">
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
