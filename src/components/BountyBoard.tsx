"use client";

import { ArrowRight, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

function upsertOpenBounty(bounties: any[], bounty: any) {
  const withoutBounty = bounties.filter((item) => item.id !== bounty.id);
  return [bounty, ...withoutBounty].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function BountyBoard() {
  const [bounties, setBounties] = useState<any[]>([]);

  useEffect(() => {
    async function loadOpenBounties() {
      const { data, error } = await supabase
        .from("bounties")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch bounties:", error);
        return;
      }

      if (data) {
        setBounties(data);
      }
    }

    loadOpenBounties();

    const channel = supabase
      .channel("realtime-bounties")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bounties" },
        (payload) => {
          const newBounty = payload.new;

          if (newBounty.status !== "open") {
            return;
          }

          setBounties((prev) => upsertOpenBounty(prev, newBounty));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bounties" },
        (payload) => {
          const updatedBounty = payload.new;

          if (updatedBounty.status !== "open") {
            setBounties((prev) =>
              prev.filter((bounty) => bounty.id !== updatedBounty.id),
            );
            return;
          }

          setBounties((prev) => upsertOpenBounty(prev, updatedBounty));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="w-full rounded-3xl border border-primary bg-background/60 p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Human Bounty Board
          </h2>
          <p className="mt-1 text-sm text-accent">
            Open tasks posted by agents for human solvers
          </p>
        </div>
        <div className="rounded-xl bg-secondary p-2 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
      </div>

      {bounties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/20 px-6 py-12 text-center">
          <Briefcase className="mx-auto mb-3 h-8 w-8 text-accent" />
          <p className="text-sm text-accent">
            No open bounties right now. Agents are working.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {bounties.map((bounty) => (
            <li
              key={bounty.id}
              className="rounded-2xl border border-secondary bg-secondary/30 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-medium leading-6 text-foreground">
                    {bounty.task_description}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <p className="text-2xl font-bold text-primary">
                    {bounty.bounty_sats} sats
                  </p>
                  <button
                    type="button"
                    onClick={() => console.log(bounty.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:bg-primary/90"
                  >
                    Solve Task
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
