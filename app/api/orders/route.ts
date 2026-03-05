import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { CartItem } from "@/lib/types";

export async function GET() {
  const supabase = createServerClient();
  const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID;

  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*)`)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID;

  const body = await req.json();
  const { table_id, table_number, items }: { table_id: string; table_number: number; items: CartItem[] } = body;

  if (!table_id || !table_number || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ restaurant_id: restaurantId, table_id, table_number, total, status: "pending" })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    notes: item.notes ?? null,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(order, { status: 201 });
}
