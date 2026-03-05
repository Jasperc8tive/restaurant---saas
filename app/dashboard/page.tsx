"use client";

import { useEffect, useState, useCallback } from "react";
import { Order } from "@/lib/types";
import OrderCard from "@/components/OrderCard";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import toast from "react-hot-toast";

const STATUS_FILTERS = ["all", "pending", "confirmed", "preparing", "ready", "completed"] as const;
type Filter = (typeof STATUS_FILTERS)[number];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Supabase realtime subscription
    const client = getSupabaseClient();
    const channel = client
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
        toast("New order received!", { icon: "🔔" });
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [fetchOrders]);

  async function handleStatusChange(orderId: string, status: Order["status"]) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } else {
      toast.error("Failed to update order status");
    }
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce(
    (acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-orange-500" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders Dashboard</h1>
            <p className="text-xs text-gray-400">
              Updated {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            href="/admin"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors"
          >
            QR Codes
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending", key: "pending", color: "text-yellow-600 bg-yellow-50" },
          { label: "In Progress", key: "preparing", color: "text-purple-600 bg-purple-50" },
          { label: "Ready", key: "ready", color: "text-green-600 bg-green-50" },
          { label: "Completed", key: "completed", color: "text-gray-500 bg-gray-50" },
        ].map(({ label, key, color }) => (
          <div key={key} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{counts[key] ?? 0}</p>
            <p className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? "bg-orange-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"
            }`}
          >
            {s} {s !== "all" && counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-medium">No {filter === "all" ? "" : filter} orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
