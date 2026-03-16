import { api } from "@/lib/axios";
import type { AuthUser } from "@/types";

export type { AuthUser };

export interface RegisterPayload {
  name: string;
  email: string;
  address: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post<AuthResponse>("/auth/login", payload);
    return res.data;
  },

  async me() {
    const res = await api.get<AuthUser>("/auth/me");
    return res.data;
  },

  async refresh() {
    const res = await api.post<RefreshResponse>("/auth/refresh");
    return res.data;
  },
};
