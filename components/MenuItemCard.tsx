"use client";

import { MenuItem, CartItem } from "@/lib/types";
import { Plus, Minus } from "lucide-react";

interface Props {
  item: MenuItem;
  cartItem?: CartItem;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

export default function MenuItemCard({ item, cartItem, onAdd, onRemove }: Props) {
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="text-orange-500 font-bold mt-1">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-1">
        {qty > 0 ? (
          <>
            <button
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold text-gray-800">{qty}</span>
            <button
              onClick={() => onAdd(item)}
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
