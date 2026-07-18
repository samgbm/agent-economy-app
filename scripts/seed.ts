import "dotenv/config";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const transactionMemos = [
  "Market Analysis API",
  "Python Code Execution",
  "Sentiment Data Stream",
  "Weather Oracle Fetch",
  "Agent Service API",
  "On-chain Risk Scanner",
  "Token Price Oracle",
  "Document Summarizer",
  "Mempool Monitor Feed",
  "Compliance Check API",
];

const solvedBounties = [
  {
    task_description: "Solve this CAPTCHA to unlock the target website.",
    solution: "The CAPTCHA text is: 4F92",
    bounty_sats: 75,
  },
  {
    task_description: "Identify the primary object in this street photo.",
    solution: "Image contains a crosswalk",
    bounty_sats: 120,
  },
  {
    task_description: "Transcribe the handwritten shipping label.",
    solution: "Deliver to 221B Baker Street, London",
    bounty_sats: 90,
  },
  {
    task_description: "Verify whether this receipt total matches the line items.",
    solution: "Total is correct at 42.17 USD after tax",
    bounty_sats: 65,
  },
  {
    task_description: "Label the sentiment of these 20 customer support tickets.",
    solution: "12 negative, 5 neutral, 3 positive",
    bounty_sats: 150,
  },
  {
    task_description: "Confirm the CAPTCHA phrase on the login portal.",
    solution: "The CAPTCHA text is: BLUE7",
    bounty_sats: 55,
  },
  {
    task_description: "Mark all vehicles in the aerial image dataset.",
    solution: "Detected 14 cars and 2 delivery vans",
    bounty_sats: 180,
  },
  {
    task_description: "Extract the 2FA backup code from the scanned document.",
    solution: "Backup code ends with 8831",
    bounty_sats: 200,
  },
  {
    task_description: "Determine if this product photo violates marketplace policy.",
    solution: "No policy violation detected",
    bounty_sats: 110,
  },
  {
    task_description: "Complete the visual puzzle to access the research archive.",
    solution: "Puzzle solved: rotate tiles 2 and 5",
    bounty_sats: 95,
  },
  {
    task_description: "Classify the noise level in this audio clip.",
    solution: "Moderate office background noise",
    bounty_sats: 70,
  },
  {
    task_description: "Identify the language used in the scanned contract page.",
    solution: "Document is written in Portuguese",
    bounty_sats: 85,
  },
  {
    task_description: "Confirm whether the warehouse image contains safety hazards.",
    solution: "One unmarked wet floor area near aisle 4",
    bounty_sats: 130,
  },
  {
    task_description: "Decode the CAPTCHA blocking the API signup flow.",
    solution: "The CAPTCHA text is: K9M3P",
    bounty_sats: 60,
  },
  {
    task_description: "Tag all pedestrians in the intersection camera frame.",
    solution: "Image contains a crosswalk with 3 pedestrians",
    bounty_sats: 160,
  },
];

const openBounties = [
  {
    task_description: "Review this smart contract for reentrancy bugs",
    bounty_sats: 175,
  },
  {
    task_description: "Categorize this image dataset",
    bounty_sats: 140,
  },
  {
    task_description: "Validate the KYC document authenticity",
    bounty_sats: 125,
  },
  {
    task_description: "Summarize this 40-page legal PDF for an agent workflow",
    bounty_sats: 190,
  },
  {
    task_description: "Solve the CAPTCHA on the legacy vendor portal",
    bounty_sats: 80,
  },
  {
    task_description: "Manually verify the warehouse inventory count sheet",
    bounty_sats: 100,
  },
  {
    task_description: "Audit this Solidity vault for flash loan attack vectors",
    bounty_sats: 200,
  },
  {
    task_description: "Label emotions in this customer interview transcript",
    bounty_sats: 115,
  },
  {
    task_description: "Confirm the map coordinates for this delivery exception",
    bounty_sats: 95,
  },
  {
    task_description: "Review the privacy policy changes for compliance risk",
    bounty_sats: 155,
  },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildTransactions() {
  return Array.from({ length: 22 }, (_, index) => ({
    amount_sats: randomInt(5, 50),
    memo: transactionMemos[index % transactionMemos.length],
    preimage: randomBytes(32).toString("hex"),
    created_at: hoursAgo(24 - index * (24 / 22)),
  }));
}

function buildBounties() {
  const solved = solvedBounties.map((bounty, index) => ({
    task_description: bounty.task_description,
    bounty_sats: bounty.bounty_sats,
    status: "solved",
    solution: bounty.solution,
    created_at: hoursAgo(72 - index * 3),
  }));

  const open = openBounties.map((bounty, index) => ({
    task_description: bounty.task_description,
    bounty_sats: bounty.bounty_sats,
    status: "open",
    created_at: hoursAgo(12 - index * 0.8),
  }));

  return [...solved, ...open];
}

async function seed() {
  console.log("[Seed] Starting dashboard seed...");

  const transactions = buildTransactions();
  const bounties = buildBounties();

  const { error: transactionError } = await supabase
    .from("transactions")
    .insert(transactions);

  if (transactionError) {
    console.error("[Seed] Failed to insert transactions:", transactionError);
  } else {
    console.log(`[Seed] Inserted ${transactions.length} transactions.`);
  }

  const { error: bountyError } = await supabase.from("bounties").insert(bounties);

  if (bountyError) {
    console.error("[Seed] Failed to insert bounties:", bountyError);
  } else {
    console.log(`[Seed] Inserted ${bounties.length} bounties.`);
  }

  console.log("[Seed] Done.");
}

seed().catch(console.error);
