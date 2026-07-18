"use server";

import { LightningAddress } from "@getalby/lightning-tools/lnurl";
import { NWCClient } from "@getalby/sdk";
import supabase from "@/lib/supabase";

export async function solveBounty(formData: FormData) {
  const bountyId = formData.get("bountyId");
  const solution = formData.get("solution");
  const lightningAddress = formData.get("lightningAddress");

  if (
    typeof bountyId !== "string" ||
    typeof solution !== "string" ||
    typeof lightningAddress !== "string"
  ) {
    throw new Error("Missing required bounty fields");
  }

  const { data: bounty, error: fetchError } = await supabase
    .from("bounties")
    .select("*")
    .eq("id", bountyId)
    .single();

  if (fetchError || !bounty) {
    throw new Error("Bounty not found");
  }

  if (bounty.status !== "open") {
    throw new Error("Bounty is not open");
  }

  const ln = new LightningAddress(lightningAddress);
  await ln.fetch();

  const invoice = await ln.requestInvoice({ satoshi: bounty.bounty_sats });

  const nwc = new NWCClient({
    nostrWalletConnectUrl: process.env.NWC_URL!,
  });

  await nwc.payInvoice({ invoice: invoice.paymentRequest });

  const { error: updateError } = await supabase
    .from("bounties")
    .update({ status: "solved", solution })
    .eq("id", bountyId);

  if (updateError) {
    throw new Error("Failed to update bounty status");
  }

  return { success: true };
}
