import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import supabase from "@/lib/supabase";
import { requireL402 } from "@/lib/l402";
import { ratelimit } from "@/lib/ratelimit";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

const agentServiceRequestSchema = z.object({
  query: z.string(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous_agent";
  const rateLimitResult = await ratelimit.limit(ip);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please slow down." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        },
      },
    );
  }

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
    amount_sats: 5,
    memo: "Agent Service API",
    preimage: l402Result,
  });

  if (error) {
    console.error("Failed to log transaction:", error);
  } else {
    console.log(`[Server] Logged 10 sats transaction. Preimage: ${l402Result}`);
  }

  const { data: settings } = await supabase
    .from("app_settings")
    .select("demo_mode")
    .eq("id", 1)
    .single();

  let analysis: string;

  if (settings?.demo_mode === true) {
    analysis =
      "[DEMO MODE INSTANT RESPONSE]: The market is highly bullish. Lightning network capacity has increased by 15%.";
  } else {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert financial and market analyst agent. Provide concise, actionable insights based on the user's query.",
        },
        {
          role: "user",
          content: parsed.data.query,
        },
      ],
    });

    analysis = completion.choices[0]?.message?.content ?? "";
  }

  return NextResponse.json({
    status: "success",
    data: {
      analysis,
      queryProcessed: parsed.data.query,
    },
  });
}
