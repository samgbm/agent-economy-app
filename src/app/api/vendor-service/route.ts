import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import supabase from "@/lib/supabase";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

const vendorServiceRequestSchema = z.object({
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

  const parsed = vendorServiceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: settings } = await supabase
    .from("app_settings")
    .select("demo_mode")
    .eq("id", 1)
    .single();

  let analysis: string;

  if (settings?.demo_mode === true) {
    analysis =
      "[DEMO MODE INSTANT RESPONSE]: Vendor service processed your request successfully.";
  } else {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a marketplace vendor API. Provide concise, actionable insights based on the user's query.",
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
    analysis,
    queryProcessed: parsed.data.query,
  });
}
