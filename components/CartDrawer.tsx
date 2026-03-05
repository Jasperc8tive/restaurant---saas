"use client";

import { CartItem } from "@/lib/types";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  cart: CartItem[];
  tableNumber: number;
  onClose: () => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onPlaceOrder: (notes: string) => Promise<void>;
}

export default function CartDrawer({ cart, tableNumber, onClose, onUpdateQty, onPlaceOrder }: Props) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit() {
    setLoading(true);
    await onPlaceOrder(notes);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg">Your Order</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 px-4 pt-3">Table {tableNumber}</p>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => (
            <div key={item.menu_item_id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-gray-500 text-sm">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQty(item.menu_item_id, -1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-orange-400 transition-colors text-sm"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.menu_item_id, 1)}
                  className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors text-sm"
                >
                  +
                </button>
                <button
                  onClick={() => onUpdateQty(item.menu_item_id, -item.quantity)}
                  className="ml-1 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-3">
          <textarea
            placeholder="Any special requests? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={2}
          />
          <div className="flex items-center justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
