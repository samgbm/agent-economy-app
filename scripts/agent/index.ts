// import "dotenv/config";
import { NWCClient } from "@getalby/sdk";
import dotenv from "dotenv";
// Explicitly tell dotenv where to find your Next.js local env file
dotenv.config({ path: ".env.local" });
const agentNwcUrl = process.env.AGENT_NWC_URL;

if (!agentNwcUrl) {
  throw new Error(
    "Missing required environment variable: AGENT_NWC_URL. The agent needs a funded NWC wallet connection to pay L402 invoices.",
  );
}

/**
 * Autonomous AI Agent script for interacting with the Agent Service API.
 * L402 proof retry logic will be added in a later increment.
 */

async function main() {
  const API_URL = "http://localhost:3000/api/agent-service";
  const payload = { query: "analyze market" };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 402) {
    console.log("[Agent] Hit paywall. Extracting invoice...");

    const wwwAuthenticate = response.headers.get("WWW-Authenticate");

    const l402HeaderPattern =
      /macaroon="([^"]+)",\s*invoice="([^"]+)"/;
    const parsedHeader = wwwAuthenticate?.match(l402HeaderPattern);

    if (!parsedHeader) {
      console.error("[Agent] Failed to parse WWW-Authenticate header.");
      return;
    }

    let macaroon = parsedHeader[1];
    let invoice = parsedHeader[2];

    console.log(
      "[Agent] Successfully extracted Macaroon:",
      macaroon.substring(0, 15) + "...",
    );
    console.log("[Agent] Successfully extracted Invoice:", invoice);

    const agentWallet = new NWCClient({
      nostrWalletConnectUrl: agentNwcUrl,
    });

    console.log("[Agent] Wallet connected. Attempting to pay invoice...");

    const paymentResponse = await agentWallet.payInvoice({ invoice });
    const preimage = paymentResponse.preimage;

    console.log("[Agent] Payment successful! Received Preimage: " + preimage);

    // TODO: Retry the API request with L402 Proof.

    return;
  }

  if (response.status === 200) {
    console.log("[Agent] Success!");

    const body = await response.json();
    console.log(body);

    return;
  }

  console.error(
    `[Agent] Unexpected response: ${response.status} ${response.statusText}`,
  );
}

main().catch((error) => {
  console.error("[Agent] Fatal error:", error);
  process.exit(1);
});
