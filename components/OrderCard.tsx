"use client";

import { Order } from "@/lib/types";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const STATUS_FLOW: Order["status"][] = ["pending", "confirmed", "preparing", "ready", "completed"];

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

interface Props {
  order: Order;
  onStatusChange: (orderId: string, status: Order["status"]) => Promise<void>;
}

export default function OrderCard({ order, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(order.status !== "completed");
  const [updating, setUpdating] = useState(false);

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1] as Order["status"] | undefined;

  async function advance() {
    if (!nextStatus) return;
    setUpdating(true);
    await onStatusChange(order.id, nextStatus);
    setUpdating(false);
  }

  const timeAgo = (() => {
    const diff = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  })();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden ${
      order.status === "completed" ? "border-gray-200 opacity-60" :
      order.status === "ready" ? "border-green-400" :
      order.status === "preparing" ? "border-purple-400" :
      order.status === "confirmed" ? "border-blue-400" :
      "border-orange-400"
    }`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">Table {order.table_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Clock size={11} />
              <span>{timeAgo}</span>
              <span className="mx-1">·</span>
              <span>{order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}</span>
              <span className="mx-1">·</span>
              <span className="font-medium text-gray-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button
              onClick={(e) => { e.stopPropagation(); advance(); }}
              disabled={updating}
              className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {updating ? "..." : `Mark ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                <span className="font-medium text-gray-900">{item.quantity}×</span> {item.name}
                {item.notes && <span className="text-gray-400 italic ml-2">({item.notes})</span>}
              </span>
              <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
