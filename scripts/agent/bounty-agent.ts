const BOUNTY_API_URL = "http://localhost:3000/api/bounties";

async function main() {
  console.log(
    "[Bounty Agent] Encountered a CAPTCHA. Outsourcing to human marketplace...",
  );

  const response = await fetch(BOUNTY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_description: "Solve this CAPTCHA to unlock the target website.",
      bounty_sats: 3,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log("[Bounty Agent] Successfully funded human task!");
    console.log(data);
    return;
  }

  console.error("[Bounty Agent] Failed to post bounty:", data);
}

main().catch((error) => {
  console.error("[Bounty Agent] Fatal error:", error);
  process.exit(1);
});
