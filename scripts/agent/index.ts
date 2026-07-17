/**
 * Autonomous AI Agent script for interacting with the Agent Service API.
 * Payment logic (Alby Lightning Wallet / L402) will be added in a later increment.
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
    console.log(wwwAuthenticate);

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
