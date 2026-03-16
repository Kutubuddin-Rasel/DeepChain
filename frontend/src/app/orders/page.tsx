"use client";

import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders.service";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { useShallow } from "zustand/shallow";
import { Order, OrderItem } from "@/types";
import { Package } from "lucide-react";

// The 4 statuses in the Figma tracker
const STATUS_STEPS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function OrdersPage() {
  const { user, token, isLoading: authLoading } = useAuthStore(
    useShallow((state: AuthState) => ({
      user: state.user,
      token: state.token,
      isLoading: state.isLoading,
    }))
  );
  const isAuthenticated = !!token && !!user;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await ordersService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, isAuthenticated]);

  // Loading Skeleton
  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-10 flex-1">
        <div className="h-10 w-48 rounded bg-foreground/5 animate-pulse mb-8"></div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-white shadow-sm border border-foreground/5 animate-pulse p-6"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 flex-1">
      <h1 className="font-serif text-2xl font-bold text-foreground mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#FAFAF9] py-20 text-center border border-foreground/5">
          <div className="mb-4 text-foreground/30">
            <Package className="h-16 w-16 mx-auto mb-2" />
            <p>No orders placed yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);
            // Format date strictly matching: "December 12th, 2025 at 4:33 PM"
            // Note: building a manual formatter to get the "th/st/nd/rd" suffix is tricky but we can format the main parts
            const d = new Date(order.createdAt);
            const month = d.toLocaleString("en-US", { month: "long" });
            const day = d.getDate();
            const year = d.getFullYear();
            const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            
            const getDaySuffix = (day: number) => {
              if (day > 3 && day < 21) return 'th';
              switch (day % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
              }
            };
            const formattedDate = `${month} ${day}${getDaySuffix(day)}, ${year} at ${time}`;

            // Determine badge styles
            let badgeStyle = "bg-orange-100 text-orange-600 border-orange-200";
            if (order.status === "COMPLETED") badgeStyle = "bg-green-100 text-green-700 border-green-200";
            else if (order.status === "READY") badgeStyle = "bg-blue-100 text-blue-600 border-blue-200";

            return (
              <div 
                key={order.id} 
                className="rounded-[16px] bg-[#FBF7F2] border border-foreground/10 px-6 py-6 shadow-sm flex flex-col"
              >
                {/* Header: Order Info on Left, Price/Status on Right */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-xs text-foreground/50 mt-1">Placed on {formattedDate}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">${Number(order.totalAmount).toFixed(2)}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${badgeStyle}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="mt-5">
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-foreground/40 uppercase mb-3">ITEMS</h3>
                  <div className="space-y-2">
                    {order.items?.map((item: OrderItem) => (
                      <div key={item.id} className="flex justify-between items-center text-[12px]">
                        <span className="font-medium text-foreground/80">{item.quantity}x {item.menuItemName}</span>
                        <span className="text-foreground/50">${Number(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="my-4 border-foreground/10" />

                {/* Total */}
                <div className="flex justify-end mb-6">
                  <span className="text-[12px] font-bold text-foreground">
                    Total Amount : ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>

                {/* Footer: Delivering to & Tracker */}
                <div className="mt-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 gap-y-10">
                  <p className="text-[12px] text-foreground/80">
                    Delivering to: <span className="text-foreground/50">{order.address}</span>
                  </p>

                  {/* Status Tracker */}
                  <div className="w-full lg:w-[420px] px-4 self-center">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line (Base) */}
                        <div className="absolute left-1 right-1 top-1/2 h-[2px] -translate-y-1/2 bg-foreground/10 z-0"></div>
                        
                        {/* Connecting Line (Active) */}
                        <div 
                          className="absolute left-1 top-1/2 h-[2px] -translate-y-1/2 bg-primary z-0 transition-all duration-500"
                          style={{ 
                            width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` 
                          }}
                        ></div>

                        {/* Tracker Dots */}
                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;
                          
                          return (
                            <div key={step} className="flex flex-col items-center justify-center relative z-10 gap-3">
                              <div 
                                className={`h-4 w-4 rounded-full border-[3px] transition-colors duration-300 ${
                                  isCompleted ? 'bg-primary border-primary' : 'bg-[#E5E7EB] border-transparent'
                                }`}
                              />
                              <span className="absolute top-6 text-[9px] font-bold tracking-wider text-foreground/40 text-center uppercase whitespace-nowrap">
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
