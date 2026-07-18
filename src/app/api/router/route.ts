import { LightningAddress } from "@getalby/lightning-tools/lnurl";
import { NWCClient } from "@getalby/sdk";
import { NextResponse } from "next/server";
import { requireL402 } from "@/lib/l402";
import supabase from "@/lib/supabase";

const PLATFORM_FEE_SATS = 2;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
    console.log(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("service_id" in body) ||
    !("payload" in body)
  ) {
    return NextResponse.json(
      { error: "Expected service_id and payload" },
      { status: 400 },
    );
  }

  const { service_id, payload } = body as {
    service_id: unknown;
    payload: unknown;
  };

  if (typeof service_id !== "string") {
    return NextResponse.json(
      { error: "Invalid service_id" },
      { status: 400 },
    );
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*, vendor:vendors(*)")
    .eq("id", service_id)
    .single();

  console.log(service);

  if (serviceError || !service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const l402Result = await requireL402(
    service.price_sats,
    `Marketplace: ${service.title}`,
    request,
  );

  if (l402Result instanceof NextResponse) {
    return l402Result;
  }

  const vendor = Array.isArray(service.vendor)
    ? service.vendor[0]
    : service.vendor;

  if (!vendor?.lightning_address) {
    return NextResponse.json(
      { error: "Vendor lightning address not configured" },
      { status: 502 },
    );
  }

  const platformFee = PLATFORM_FEE_SATS;
  const vendorPayout = service.price_sats - platformFee;

  if (vendorPayout <= 0) {
    return NextResponse.json(
      { error: "Service price must exceed the platform fee" },
      { status: 400 },
    );
  }

  console.log(
    `[Router] Payment received! Taking ${platformFee} sats fee. Routing ${vendorPayout} sats to Vendor...`,
  );

  try {
    const ln = new LightningAddress(vendor.lightning_address);
    await ln.fetch();

    const invoice = await ln.requestInvoice({ satoshi: vendorPayout });

    const nwc = new NWCClient({
      nostrWalletConnectUrl: process.env.NWC_URL!,
    });

    await nwc.payInvoice({ invoice: invoice.paymentRequest });
  } catch (error) {
    console.error("[Router] Vendor payout failed:", error);
    return NextResponse.json(
      { error: "Failed to pay vendor for marketplace service" },
      { status: 502 },
    );
  }

  let vendorResponse: unknown;

  try {
    const vendorReq = await fetch(service.endpoint_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });

    if (!vendorReq.ok) {
      return NextResponse.json(
        {
          error: "Vendor API returned an error",
          status: vendorReq.status,
        },
        { status: 502 },
      );
    }

    vendorResponse = await vendorReq.json();
  } catch (error) {
    console.error("[Router] Vendor API request failed:", error);
    return NextResponse.json(
      { error: "Vendor API request failed or timed out" },
      { status: 504 },
    );
  }

  return NextResponse.json({
    status: "success",
    data: vendorResponse,
  });
}
