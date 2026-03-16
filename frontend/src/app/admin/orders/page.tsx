"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ordersService } from "@/services/orders.service";
import { Order, OrderStatus, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import axios from "axios";

const STATUS_STEPS: OrderStatus[] = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page"));
  const initialPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [page, setPage] = useState(initialPage);
  const limit = 10;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginatedResponse<Order>["meta"] | null>(null);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (pageOverride?: number) => {
    setIsLoading(true);
    try {
      const res = await ordersService.getAllOrders({ page: pageOverride ?? page, limit });
      setOrders(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [limit, page]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      toast.success("Order status updated");
      setOrders((prev) => 
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update status");
      } else {
        toast.error("Failed to update status");
      }
      fetchOrders(); // refresh on failure to reset select
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day}, ${time}`;
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    setPage(nextPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin/orders?${params.toString()}`);
  };

  if (isLoading) {
    return <div className="p-8 text-foreground/50">Loading orders...</div>;
  }

  return (
    <div className="p-8 max-w-250 mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-foreground/10">
        <h1 className="font-serif text-2xl font-bold text-foreground">Order Management</h1>
      </div>

      <div className="bg-white rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-foreground/80">
          <thead className="bg-[#F7F4EF] text-foreground font-semibold border-b border-foreground/10">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100 text-black">
                <td className="px-6 py-3 font-medium">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-3">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-3">{order.user?.name || "John Doe"}</td>
                <td className="px-6 py-3 font-semibold">${Number(order.totalAmount).toFixed(2)}</td>
                <td className="px-6 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="bg-white border border-foreground/10 text-foreground rounded-md focus:ring-primary focus:border-primary block w-full px-3 py-1.5 outline-none cursor-pointer"
                  >
                    {STATUS_STEPS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer bg-[#F7F4EF] hover:bg-foreground/5 text-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-foreground/10"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-foreground/50">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/10 bg-[#FBFAF8]">
            <span className="text-sm text-foreground/60">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="cursor-pointer rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={meta.totalPages === 0 || page >= meta.totalPages}
                className="cursor-pointer rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-[#FBF7F2] rounded-2xl shadow-xl w-full max-w-130 overflow-hidden border border-foreground/10">
            <div className="flex justify-between items-center p-5 border-b border-foreground/10">
              <div>
                <h2 className="text-lg font-bold text-foreground">Order Details</h2>
                <p className="text-xs text-foreground/60">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="cursor-pointer text-foreground/40 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm text-black">
              <div>
                <p className="font-bold tracking-wider uppercase mb-1">Address</p>
                <p>{selectedOrder.address}</p>
              </div>

              <div>
                <p className="font-bold tracking-wider uppercase mb-2 border-b border-foreground/10 pb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm text-black">
                      <span className="font-medium">{item.quantity}x {item.menuItemName}</span>
                      <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-foreground/10 flex justify-between items-center text-black">
                <span className="font-bold">Total</span>
                <span className="font-bold">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
