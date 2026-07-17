"use client";

import { Activity, Coins, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export function RevenueTracker() {
  const [totalSats, setTotalSats] = useState<number>(0);
  const [txCount, setTxCount] = useState<number>(0);

  useEffect(() => {
    async function loadRevenueStats() {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount_sats");

      if (error) {
        console.error("Failed to fetch revenue stats:", error);
        return;
      }

      if (data) {
        const sum = data.reduce(
          (acc, transaction) => acc + (transaction.amount_sats ?? 0),
          0,
        );
        setTotalSats(sum);
        setTxCount(data.length);
      }
    }

    loadRevenueStats();

    const channel = supabase
      .channel("realtime-revenue")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          setTotalSats((prev) => prev + (payload.new.amount_sats ?? 0));
          setTxCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
      <div className="rounded-2xl border border-secondary bg-secondary/40 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-accent">Total Sats Earned</p>
          <div className="rounded-xl bg-background p-2 text-primary">
            <Coins className="h-5 w-5" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          {totalSats.toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-accent">Lifetime Lightning revenue</p>
      </div>

      <div className="rounded-2xl border border-secondary bg-secondary/40 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-accent">Total Transactions</p>
          <div className="rounded-xl bg-background p-2 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {txCount.toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-accent">Verified L402 payments</p>
      </div>

      <div className="rounded-2xl border border-secondary bg-secondary/40 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-accent">Network Status</p>
          <div className="rounded-xl bg-background p-2 text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          <p className="text-xl font-semibold text-foreground">
            Lightning Mainnet
          </p>
        </div>
        <p className="mt-2 text-xs text-accent">All systems operational</p>
      </div>
    </section>
  );
}
