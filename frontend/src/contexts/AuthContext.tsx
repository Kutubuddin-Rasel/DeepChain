"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
  }, []);

  useEffect(() => {
    // Check for existing session
    const storedToken = Cookies.get("token");
    const storedUserStr = Cookies.get("user");

    const loadSession = async () => {
      if (storedToken && storedUserStr) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUserStr));
          // Verify with backend
          const res = await api.get('/auth/me');
          setUser(res.data);
          Cookies.set("user", JSON.stringify(res.data), { expires: 7 });
        } catch (error) {
          console.error("Session verification failed", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, [logout]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    Cookies.set("token", newToken, { expires: 7 });
    Cookies.set("user", JSON.stringify(newUser), { expires: 7 });
  };


  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
