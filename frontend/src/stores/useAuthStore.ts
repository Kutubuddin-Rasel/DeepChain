import { create } from "zustand";
import type { StateCreator } from "zustand";
import Cookies from "js-cookie";
import type { AuthUser } from "@/types";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const createAuthStore: StateCreator<AuthState> = (set) => ({
  user: null,
  token: null,
  isLoading: true,
  setLoading: (value: boolean) => set({ isLoading: value }),
  setUser: (user: AuthUser | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  login: (token: string, user: AuthUser) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 });
    set({ token, user });
  },
  logout: () => {
    Cookies.remove("token");
    Cookies.remove("user");
    set({ token: null, user: null });
  },
});

export const useAuthStore = create<AuthState>(createAuthStore);
