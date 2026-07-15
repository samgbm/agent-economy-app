import { NextResponse } from "next/server";
import { z } from "zod";

const agentServiceRequestSchema = z.object({
  query: z.string(),
});

export async function POST(request: Request) {
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
