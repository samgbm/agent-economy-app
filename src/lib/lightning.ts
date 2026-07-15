import { decodeInvoice } from "@getalby/lightning-tools/bolt11";
import * as webln from "@getalby/sdk";

const nwcUrl = process.env.NWC_URL;

if (!nwcUrl) {
  throw new Error("Missing required environment variable: NWC_URL");
}

export const lightningProvider = new webln.NostrWebLNProvider({
  nostrWalletConnectUrl: nwcUrl,
});

export async function generateInvoice(amountInSats: number, memo: string) {
  await lightningProvider.enable();

  const invoice = await lightningProvider.makeInvoice({
    amount: amountInSats,
    defaultMemo: memo,
  });

  const paymentHash =
    "paymentHash" in invoice && typeof invoice.paymentHash === "string"
      ? invoice.paymentHash
      : decodeInvoice(invoice.paymentRequest)?.paymentHash;

  if (!paymentHash) {
    throw new Error("Failed to decode payment hash from invoice");
  }

  return {
    paymentRequest: invoice.paymentRequest,
    paymentHash,
  };
}
