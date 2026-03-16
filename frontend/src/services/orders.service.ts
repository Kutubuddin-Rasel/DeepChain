import { api } from "@/lib/axios";
import type { Order, OrderStatus, PaginatedResponse } from "@/types";

export interface CreateOrderItemPayload {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  address: string;
  items: CreateOrderItemPayload[];
}

export const ordersService = {
  async createOrder(payload: CreateOrderPayload) {
    const res = await api.post<Order>("/orders", payload);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get<Order[]>("/orders/my");
    return res.data;
  },

  async getAllOrders(params?: { page?: number; limit?: number }) {
    const res = await api.get<PaginatedResponse<Order>>("/orders", { params });
    return res.data;
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    const res = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return res.data;
  },
};
