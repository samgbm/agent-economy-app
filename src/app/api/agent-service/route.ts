import { NextResponse } from "next/server";
import { z } from "zod";
import supabase from "@/lib/supabase";
import { requireL402 } from "@/lib/l402";

const agentServiceRequestSchema = z.object({
  query: z.string(),
});

export async function POST(request: Request) {
  const l402Result = await requireL402(5, "Agent Service API", request);

  if (l402Result instanceof NextResponse) {
    return l402Result;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = agentServiceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("transactions").insert({
    amount_sats: 10,
    memo: "Agent Service API",
    preimage: l402Result,
  });

  if (error) {
    console.error("Failed to log transaction:", error);
  } else {
    console.log(`[Server] Logged 10 sats transaction. Preimage: ${l402Result}`);
  }

  return NextResponse.json({
    status: "success",
    data: {
      analysis: "Market is bullish based on recent node deployments.",
      queryProcessed: parsed.data.query,
    },
  });
}
