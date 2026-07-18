import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  console.log("[Health Check] Ping received. Keeping server warm.");

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
}
