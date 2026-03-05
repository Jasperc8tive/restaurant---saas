import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();
  const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID;

  const { data, error } = await supabase
    .from("menu_items")
    .select(`*, category:menu_categories(*)`)
    .eq("restaurant_id", restaurantId)
    .eq("available", true)
    .order("category_id")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
