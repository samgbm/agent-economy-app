import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

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

  if (
    typeof body !== "object" ||
    body === null ||
    !("task_description" in body) ||
    !("bounty_sats" in body)
  ) {
    return NextResponse.json(
      { error: "Expected task_description and bounty_sats" },
      { status: 400 },
    );
  }

  const { task_description, bounty_sats } = body as {
    task_description: unknown;
    bounty_sats: unknown;
  };

  if (typeof task_description !== "string" || typeof bounty_sats !== "number") {
    return NextResponse.json(
      { error: "Invalid task_description or bounty_sats" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("bounties").insert({
    task_description,
    bounty_sats,
    status: "open",
  });

  if (error) {
    console.error("Failed to post bounty:", error);
    return NextResponse.json(
      { error: "Failed to post bounty" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: "success",
    message: "Bounty posted",
  });
}
