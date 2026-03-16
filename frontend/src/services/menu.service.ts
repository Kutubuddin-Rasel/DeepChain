import { api } from "@/lib/axios";
import type { MenuItem, PaginatedResponse } from "@/types";

export type MenuSortOrder = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";

export interface MenuQueryParams {
  search?: string;
  category?: string;
  available?: string;
  page?: number;
  limit?: number;
  sort?: MenuSortOrder;
}

export const menuService = {
  async list(params?: MenuQueryParams) {
    const res = await api.get<PaginatedResponse<MenuItem>>("/menu-items", { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<MenuItem>(`/menu-items/${id}`);
    return res.data;
  },

  async create(formData: FormData) {
    const res = await api.post<MenuItem>("/menu-items", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  async update(id: string, formData: FormData) {
    const res = await api.patch<MenuItem>(`/menu-items/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<{ message: string }>(`/menu-items/${id}`);
    return res.data;
  },
};
