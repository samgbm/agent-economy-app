"use client";

import { Bot, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

function truncatePreimage(preimage: string, length = 16) {
  if (preimage.length <= length) {
    return preimage;
  }

  return `${preimage.slice(0, length)}...`;
}

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string | number>>(
    new Set(),
  );

  useEffect(() => {
    async function loadRecentTransactions() {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Failed to fetch transactions:", error);
        return;
      }

      if (data) {
        setTransactions(data);
      }
    }

    loadRecentTransactions();

    const channel = supabase
      .channel("realtime-txs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newTransaction = payload.new;

          setTransactions((prev) => [newTransaction, ...prev].slice(0, 5));

          if (newTransaction?.id !== undefined) {
            setHighlightedIds((prev) => new Set(prev).add(newTransaction.id));

            window.setTimeout(() => {
              setHighlightedIds((prev) => {
                const next = new Set(prev);
                next.delete(newTransaction.id);
                return next;
              });
            }, 3000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Live Transaction Feed
          </h2>
          <p className="mt-1 text-sm text-accent">
            Real-time L402 payments from autonomous agents
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-secondary bg-secondary/40 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Live
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-secondary bg-secondary/20 px-6 py-12 text-center">
          <Bot className="mx-auto mb-3 h-8 w-8 text-accent" />
          <p className="text-sm text-accent">
            Waiting for the first agent payment...
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {transactions.map((transaction) => {
            const isNew = highlightedIds.has(transaction.id);

            return (
              <li
                key={transaction.id ?? transaction.preimage}
                className={`rounded-2xl border bg-background p-5 shadow-sm transition-all duration-500 ${
                  isNew
                    ? "border-primary/60 shadow-[0_0_24px_-8px_var(--primary)] motion-safe:animate-pulse"
                    : "border-secondary"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-secondary p-2 text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.memo ?? "Agent payment"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-accent">
                        preimage:{" "}
                        {truncatePreimage(String(transaction.preimage ?? ""))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">
                      {transaction.amount_sats} sats
                    </p>
                    {isNew ? (
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        New
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
