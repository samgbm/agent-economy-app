import crypto from "node:crypto";
import { NextResponse } from "next/server";
import * as macaroon from "macaroon";
import { generateInvoice } from "@/lib/lightning";

const macaroonSecret = process.env.MACAROON_SECRET;

if (!macaroonSecret) {
  throw new Error("Missing required environment variable: MACAROON_SECRET");
}

const PAYMENT_HASH_CAVEAT_PREFIX = "payment_hash = ";

function caveatToString(identifier: Uint8Array): string {
  return Buffer.from(identifier).toString("utf8");
}

export async function requireL402(
  amountInSats: number,
  memo: string,
  request: Request,
): Promise<NextResponse | string> {
  const authorization = request.headers.get("Authorization");

  if (authorization?.startsWith("L402")) {
    const credentials = authorization.slice("L402".length).trim();
    const separatorIndex = credentials.indexOf(":");

    if (separatorIndex === -1) {
      return NextResponse.json(
        { error: "Malformed Authorization header" },
        { status: 400 },
      );
    }

    const macaroonBase64 = credentials.slice(0, separatorIndex);
    const preimageHex = credentials.slice(separatorIndex + 1);

    if (!macaroonBase64 || !preimageHex) {
      return NextResponse.json(
        { error: "Malformed Authorization header" },
        { status: 400 },
      );
    }

    let macaroonInstance: ReturnType<typeof macaroon.importMacaroon>;

    try {
      macaroonInstance = macaroon.importMacaroon(macaroonBase64);
    } catch {
      return NextResponse.json(
        { error: "Malformed Authorization header" },
        { status: 400 },
      );
    }

    try {
      macaroonInstance.verify(macaroonSecret, () => null);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized macaroon" },
        { status: 401 },
      );
    }

    let macaroonPaymentHash: string | undefined;

    for (const caveat of macaroonInstance.caveats) {
      const caveatText = caveatToString(caveat.identifier);

      if (caveatText.startsWith(PAYMENT_HASH_CAVEAT_PREFIX)) {
        macaroonPaymentHash = caveatText.slice(PAYMENT_HASH_CAVEAT_PREFIX.length);
        break;
      }
    }

    if (!macaroonPaymentHash) {
      return NextResponse.json(
        { error: "Unauthorized macaroon" },
        { status: 401 },
      );
    }

    const preimageBuffer = Buffer.from(preimageHex, "hex");
    const derivedPaymentHash = crypto
      .createHash("sha256")
      .update(preimageBuffer)
      .digest("hex");

    if (derivedPaymentHash !== macaroonPaymentHash) {
      return NextResponse.json(
        { error: "Invalid preimage. Payment not verified." },
        { status: 401 },
      );
    }

    return preimageHex;
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

  mac.addFirstPartyCaveat(`${PAYMENT_HASH_CAVEAT_PREFIX}${paymentHash}`);

  const serializedMacaroon = macaroon.bytesToBase64(mac.exportBinary());

  return new NextResponse(null, {
    status: 402,
    headers: {
      "WWW-Authenticate": `L402 macaroon="${serializedMacaroon}", invoice="${paymentRequest}"`,
    },
  });
}
