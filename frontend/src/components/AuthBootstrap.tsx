"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useShallow } from "zustand/shallow";

export function AuthBootstrap() {
  const { setUser, setToken, setLoading, logout } = useAuthStore(
    useShallow((state: AuthState) => ({
      setUser: state.setUser,
      setToken: state.setToken,
      setLoading: state.setLoading,
      logout: state.logout,
    }))
  );

  useEffect(() => {
    const storedToken = Cookies.get("token");
    const storedUserStr = Cookies.get("user");

    const loadSession = async () => {
      if (storedToken && storedUserStr) {
        setToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUserStr) as AuthUser;
          setUser(parsedUser);
          const me = await authService.me();
          setUser(me);
          Cookies.set("user", JSON.stringify(me), { expires: 7 });
        } catch (error) {
          console.error("Session verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadSession();
  }, [logout, setLoading, setToken, setUser]);

  return null;
}
