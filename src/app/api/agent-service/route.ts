import { NextResponse } from "next/server";
import { z } from "zod";
import { requireL402 } from "@/lib/l402";

const agentServiceRequestSchema = z.object({
  query: z.string(),
});

export async function POST(request: Request) {
  const l402Response = await requireL402(10, "Agent Service API", request);

  if (l402Response) {
    return l402Response;
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

  return NextResponse.json({
    status: "success",
    data: {
      analysis: "Market is bullish based on recent node deployments.",
      queryProcessed: parsed.data.query,
    },
  });
}
