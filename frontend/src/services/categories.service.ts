import { api } from "@/lib/axios";
import type { Category } from "@/types";

export const categoriesService = {
  async list() {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },

  async create(name: string) {
    const res = await api.post<Category>("/categories", { name });
    return res.data;
  },

  async update(id: string, name: string) {
    const res = await api.patch<Category>(`/categories/${id}`, { name });
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};
