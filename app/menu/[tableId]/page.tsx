"use client";

import { useEffect, useState, use } from "react";
import { MenuItem, MenuCategory, CartItem, Table } from "@/lib/types";
import MenuItemCard from "@/components/MenuItemCard";
import CartDrawer from "@/components/CartDrawer";
import { ShoppingBag, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function MenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [menuRes, tablesRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/tables"),
      ]);
      const items: MenuItem[] = await menuRes.json();
      const tables: Table[] = await tablesRes.json();

      setMenuItems(items);
      const found = tables.find((t) => t.id === tableId) ?? null;
      setTable(found);
      if (items.length > 0) setActiveCategory(items[0].category.id);
      setLoading(false);
    }
    load();
  }, [tableId]);

  const categories: MenuCategory[] = Array.from(
    new Map(menuItems.map((i) => [i.category.id, i.category])).values()
  ).sort((a, b) => a.sort_order - b.sort_order);

  const filteredItems = activeCategory
    ? menuItems.filter((i) => i.category.id === activeCategory)
    : menuItems;

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((c) => c.menu_item_id !== itemId);
      return prev.map((c) =>
        c.menu_item_id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === itemId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter((c) => c.menu_item_id !== itemId);
      return prev.map((c) =>
        c.menu_item_id === itemId ? { ...c, quantity: newQty } : c
      );
    });
  }

  async function placeOrder() {
    if (!table) return;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_id: table.id, table_number: table.table_number, items: cart }),
    });
    if (!res.ok) {
      toast.error("Failed to place order. Please try again.");
      return;
    }
    setCart([]);
    setCartOpen(false);
    setOrdered(true);
    toast.success("Order placed successfully!");
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-6 text-center">
        <p className="text-2xl">404</p>
        <p className="text-gray-500">Table not found. Please scan the correct QR code.</p>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <CheckCircle size={64} className="text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-gray-500">Your order has been sent to the kitchen. We&apos;ll have it ready soon.</p>
        <button
          onClick={() => setOrdered(false)}
          className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? "Menu"}
          </h1>
          <p className="text-sm text-gray-400">Table {table.table_number}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            cartItem={cart.find((c) => c.menu_item_id === item.id)}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        ))}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-orange-500 text-white px-6 py-3.5 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors max-w-sm w-full"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="flex-1 font-semibold text-left">View Order</span>
            <span className="font-semibold">
              ${cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          tableNumber={table.table_number}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onPlaceOrder={placeOrder}
        />
      )}
    </div>
  );
}
