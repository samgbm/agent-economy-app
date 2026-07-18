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

const vendorPrefixes = [
  "Neural",
  "Quantum",
  "Nexus",
  "Apex",
  "Cyber",
  "Synth",
  "Aura",
];

const vendorSuffixes = [
  "Labs",
  "AI",
  "Systems",
  "Networks",
  "Dynamics",
  "Compute",
];

const categories = [
  "Data Analysis",
  "Creative/Art",
  "Smart Contracts",
  "Entertainment",
  "Web Scraping",
];

const serviceTitlesByCategory: Record<string, string[]> = {
  "Data Analysis": [
    "Real-time Sentiment Oracle",
    "Macro Trend Forecaster",
    "Anomaly Detection Stream",
    "Market Signal Aggregator",
  ],
  "Creative/Art": [
    "Meme Generator API",
    "Brand Voice Synthesizer",
    "Visual Prompt Studio",
    "Storyboard Composer",
  ],
  "Smart Contracts": [
    "Solidity Auditing Agent",
    "Reentrancy Scanner Pro",
    "Vault Risk Monitor",
    "Bytecode Explainer API",
  ],
  Entertainment: [
    "Stand-up Joke Generator",
    "Late Night Monologue API",
    "Punchline Optimizer",
    "Comedy Roast Engine",
  ],
  "Web Scraping": [
    "Headless Browser Scraper",
    "Anti-bot Bypass Crawler",
    "Structured Data Extractor",
    "Dynamic DOM Watcher",
  ],
};

const payloadFormatsByCategory: Record<string, object> = {
  "Data Analysis": { query: "string", timeframe: "string" },
  "Creative/Art": { prompt: "string", style: "string" },
  "Smart Contracts": { contract_address: "string", chain: "string" },
  Entertainment: { topic: "string" },
  "Web Scraping": { url: "string", selector: "string" },
};

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
];

const openBounties = [
  {
    task_description: "Review this smart contract for reentrancy bugs",
    bounty_sats: 175,
  },
  {
    task_description: "Categorize this image dataset for agent training",
    bounty_sats: 140,
  },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function pickRandom<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function slugifyVendorName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "");
}

async function clearTable(table: "services" | "vendors" | "bounties" | "transactions") {
  const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    throw new Error(`Failed to clear ${table}: ${error.message}`);
  }

  console.log(`[Seed] Cleared ${table}.`);
}

function buildVendorRecords() {
  const usedNames = new Set<string>();

  return Array.from({ length: 15 }, (_, index) => {
    let name = "";

    do {
      name = `${pickRandom(vendorPrefixes)} ${pickRandom(vendorSuffixes)}`;
    } while (usedNames.has(name));

    usedNames.add(name);

    const reputationScore =
      index < 4 ? randomInt(40, 55) : randomInt(40, 100);

    const slug = slugifyVendorName(name);

    return {
      name,
      description: `${name} builds autonomous AI services for the agent economy marketplace.`,
      reputation_score: reputationScore,
      staked_sats: randomInt(100, 5000),
      lightning_address: `${slug}@getalby.com`,
    };
  });
}

function buildServicesForVendor(
  vendor: { id: string; name: string },
  serviceCount: number,
) {
  const slug = slugifyVendorName(vendor.name);
  const services = [];
  const usedTitles = new Set<string>();

  for (let index = 0; index < serviceCount; index += 1) {
    const category = pickRandom(categories);
    const titleOptions = serviceTitlesByCategory[category];
    let title = pickRandom(titleOptions);

    while (usedTitles.has(title)) {
      title = pickRandom(titleOptions);
    }

    usedTitles.add(title);

    services.push({
      vendor_id: vendor.id,
      category,
      title,
      description: `${title} offered by ${vendor.name} for autonomous agent workflows.`,
      price_sats: randomInt(5, 200),
      endpoint_url: `https://api.${slug}.com/v1/execute`,
      payload_format: payloadFormatsByCategory[category],
      uptime_percentage: randomFloat(95.0, 99.9),
      avg_latency_ms: randomInt(50, 800),
      is_active: true,
    });
  }

  return services;
}

function buildTransactions() {
  return Array.from({ length: 10 }, (_, index) => ({
    amount_sats: randomInt(5, 50),
    memo: transactionMemos[index % transactionMemos.length],
    preimage: randomBytes(32).toString("hex"),
    created_at: hoursAgo(24 - index * 2.4),
  }));
}

function buildBounties() {
  const solved = solvedBounties.map((bounty, index) => ({
    task_description: bounty.task_description,
    bounty_sats: bounty.bounty_sats,
    status: "solved",
    solution: bounty.solution,
    created_at: hoursAgo(72 - index * 4),
  }));

  const open = openBounties.map((bounty, index) => ({
    task_description: bounty.task_description,
    bounty_sats: bounty.bounty_sats,
    status: "open",
    created_at: hoursAgo(12 - index * 2),
  }));

  return [...solved, ...open];
}

async function seed() {
  console.log("[Seed] Starting marketplace seed...");

  console.log("[Seed] Clearing existing marketplace data...");
  await clearTable("services");
  await clearTable("vendors");
  await clearTable("bounties");
  await clearTable("transactions");

  console.log("[Seed] Creating vendors...");
  const vendorRecords = buildVendorRecords();

  const { data: insertedVendors, error: vendorError } = await supabase
    .from("vendors")
    .insert(vendorRecords)
    .select("id, name");

  if (vendorError || !insertedVendors) {
    throw new Error(`Failed to insert vendors: ${vendorError?.message}`);
  }

  console.log(`[Seed] Inserted ${insertedVendors.length} vendors.`);

  console.log("[Seed] Creating services...");
  const allServices = insertedVendors.flatMap((vendor) =>
    buildServicesForVendor(vendor, randomInt(2, 4)),
  );

  const { error: serviceError } = await supabase.from("services").insert(allServices);

  if (serviceError) {
    throw new Error(`Failed to insert services: ${serviceError.message}`);
  }

  console.log(`[Seed] Inserted ${allServices.length} services.`);

  console.log("[Seed] Creating transactions...");
  const transactions = buildTransactions();
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert(transactions);

  if (transactionError) {
    throw new Error(`Failed to insert transactions: ${transactionError.message}`);
  }

  console.log(`[Seed] Inserted ${transactions.length} transactions.`);

  console.log("[Seed] Creating bounties...");
  const bounties = buildBounties();
  const { error: bountyError } = await supabase.from("bounties").insert(bounties);

  if (bountyError) {
    throw new Error(`Failed to insert bounties: ${bountyError.message}`);
  }

  console.log(`[Seed] Inserted ${bounties.length} bounties.`);
  console.log("[Seed] Marketplace seed complete.");
}

seed().catch((error) => {
  console.error("[Seed] Failed:", error);
  process.exit(1);
});
