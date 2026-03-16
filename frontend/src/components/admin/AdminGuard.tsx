"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useShallow } from "zustand/shallow";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { token, user } = useAuthStore(
    useShallow((state: AuthState) => ({
      token: state.token,
      user: state.user,
    }))
  );
  // Wait one tick for Zustand to rehydrate from localStorage before redirecting
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !user) {
      // Not logged in — send to login page, then redirect back to admin after login
      router.replace("/auth?mode=login&redirect=/admin/menu-items");
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("Access denied. Admin only.");
      router.replace("/");
    }
  }, [hydrated, token, user, router]);

  // While hydrating or about to redirect, show nothing (or a subtle spinner)
  if (!hydrated || !token || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7F2]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
