import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const maxPrice = searchParams.get("maxPrice");
  const minReputation = searchParams.get("minReputation");

  let query = supabase
    .from("services")
    .select("*, vendor:vendors!inner(*)")
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (maxPrice) {
    query = query.lte("price_sats", parseInt(maxPrice, 10));
  }

  if (minReputation) {
    query = query.gte("vendors.reputation_score", parseInt(minReputation, 10));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch catalog services:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog services" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: "success",
    count: data?.length ?? 0,
    services: data ?? [],
  });
}
