import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

const jokeRequestSchema = z.object({
  topic: z.string(),
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

  const parsed = jokeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a hilarious stand-up comedian. Write a short, punchy, 2-sentence joke about the user's topic.",
      },
      {
        role: "user",
        content: parsed.data.topic,
      },
    ],
  });

  const joke = completion.choices[0]?.message?.content ?? "";

  return NextResponse.json({
    status: "success",
    joke,
  });
}
