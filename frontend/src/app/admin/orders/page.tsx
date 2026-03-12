"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Order, OrderStatus } from "@/types";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import axios from "axios";

const STATUS_STEPS: OrderStatus[] = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/orders"); // requires server to return user info as well
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
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

  if (isLoading) {
    return <div className="p-8 text-foreground/50">Loading orders...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-foreground/10">
        <h1 className="font-serif text-3xl font-bold text-primary">Order Management</h1>
      </div>

      <div className="bg-white rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-foreground/80">
          <thead className="bg-[#FBFAF8] text-foreground font-semibold border-b border-foreground/10">
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
              <tr key={order.id} className="hover:bg-foreground/[0.02]">
                <td className="px-6 py-4 font-medium text-foreground">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4">{order.user?.name || "Unknown"}</td>
                <td className="px-6 py-4 font-semibold text-foreground">${Number(order.totalAmount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="bg-secondary/50 border border-foreground/10 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2 outline-none cursor-pointer"
                  >
                    {STATUS_STEPS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-[#FAF9F6] hover:bg-foreground/5 text-foreground px-4 py-2 rounded-lg font-medium transition-colors border border-foreground/10"
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
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-foreground/5 bg-[#FAF9F6]">
              <h2 className="text-xl font-bold text-primary">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-foreground/40 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold tracking-wider text-foreground/40 uppercase mb-1">Order ID</p>
                <p className="font-medium text-foreground">#{selectedOrder.id}</p>
              </div>

              <div>
                <p className="text-sm font-bold tracking-wider text-foreground/40 uppercase mb-1">Address</p>
                <p className="text-foreground/80 leading-relaxed max-w-sm">{selectedOrder.address}</p>
              </div>

              <div>
                <p className="text-sm font-bold tracking-wider text-foreground/40 uppercase mb-3 border-b border-foreground/10 pb-2">Items</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-foreground/80 font-medium">{item.quantity}x {item.menuItemName}</span>
                      <span className="text-foreground/60">${Number(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/10 flex justify-between items-center">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
