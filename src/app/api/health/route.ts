import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
}
