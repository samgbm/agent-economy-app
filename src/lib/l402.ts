import { NextResponse } from "next/server";
import * as macaroon from "macaroon";
import { generateInvoice } from "@/lib/lightning";



const macaroonSecret = process.env.MACAROON_SECRET;

if (!macaroonSecret) {
  throw new Error("Missing required environment variable: MACAROON_SECRET");
}

export async function requireL402(
  amountInSats: number,
  memo: string,
  request: Request,
): Promise<NextResponse | null> {
  const authorization = request.headers.get("Authorization");

  if (authorization?.startsWith("L402")) {
    return null;
  }

  const { paymentRequest, paymentHash } = await generateInvoice(
    amountInSats,
    memo,
  );

  const mac = macaroon.newMacaroon({
    rootKey: macaroonSecret,
    identifier: paymentHash,
    location: "agent-economy-app",
  });

  mac.addFirstPartyCaveat(`payment_hash = ${paymentHash}`);

  const serializedMacaroon = macaroon.bytesToBase64(mac.exportBinary());

  return new NextResponse(null, {
    status: 402,
    headers: {
      "WWW-Authenticate": `L402 macaroon="${serializedMacaroon}", invoice="${paymentRequest}"`,
    },
  });
}
