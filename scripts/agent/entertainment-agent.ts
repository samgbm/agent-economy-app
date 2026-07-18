import "dotenv/config";

import { NWCClient } from "@getalby/sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const agentNwcUrl = process.env.AGENT_NWC_URL;

if (!agentNwcUrl) {
  throw new Error(
    "Missing required environment variable: AGENT_NWC_URL. The agent needs a funded NWC wallet connection to pay L402 invoices.",
  );
}

const CATALOG_URL =
  "http://localhost:3000/api/catalog?category=Entertainment";
const ROUTER_URL = "http://localhost:3000/api/router";

const l402HeaderPattern = /macaroon="([^"]+)",\s*invoice="([^"]+)"/;

async function main() {
  const catalogResponse = await fetch(CATALOG_URL);

  if (!catalogResponse.ok) {
    console.error(
      `[Joy Agent] Catalog discovery failed: ${catalogResponse.status}`,
    );
    process.exit(1);
  }

  const catalogData = await catalogResponse.json();

  if (!catalogData.services?.length) {
    console.error("[Joy Agent] No Entertainment services found in catalog.");
    process.exit(1);
  }

  const service = catalogData.services[0];
  const targetServiceId = service.id;

  console.log(
    `[Joy Agent] Discovered Entertainment service: ${service.title}`,
  );

  const payload = { topic: "Bitcoin developers debugging code at 3 AM" };
  const routerBody = {
    service_id: targetServiceId,
    payload,
  };

  const response = await fetch(ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routerBody),
  });

  if (response.status !== 402) {
    console.error(
      `[Joy Agent] Expected 402 Payment Required, got ${response.status}`,
    );
    process.exit(1);
  }

  const wwwAuthenticate = response.headers.get("WWW-Authenticate");
  const parsedHeader = wwwAuthenticate?.match(l402HeaderPattern);

  if (!parsedHeader) {
    console.error("[Joy Agent] Failed to parse WWW-Authenticate header.");
    process.exit(1);
  }

  const macaroon = parsedHeader[1];
  const invoice = parsedHeader[2];

  const agentWallet = new NWCClient({
    nostrWalletConnectUrl: agentNwcUrl,
  });

  const paymentResponse = await agentWallet.payInvoice({ invoice });
  const preimage = paymentResponse.preimage;

  const retryResponse = await fetch(ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `L402 ${macaroon}:${preimage}`,
    },
    body: JSON.stringify(routerBody),
  });

  const finalData = await retryResponse.json();
  const joke = finalData.data?.joke ?? finalData.joke;

  console.log(`\n🎉 [Joy Agent] Delivery for my human: ${joke}\n`);
}

main().catch(console.error);
