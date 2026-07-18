"use client";

import { solveBounty } from "@/app/actions/solveBounty";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  ListChecks,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

const PAGE_SIZE = 6;

function upsertBounty(bounties: any[], bounty: any) {
  const withoutBounty = bounties.filter((item) => item.id !== bounty.id);
  return [bounty, ...withoutBounty].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function BountyBoard() {
  const [bounties, setBounties] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const openCount = bounties.filter((bounty) => bounty.status === "open").length;
  const solvedCount = bounties.filter(
    (bounty) => bounty.status === "solved",
  ).length;
  const totalSatsPaid = bounties
    .filter((bounty) => bounty.status === "solved")
    .reduce((sum, bounty) => sum + (bounty.bounty_sats ?? 0), 0);

  useEffect(() => {
    async function loadBounties() {
      const { data, error } = await supabase
        .from("bounties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch bounties:", error);
        return;
      }

      if (data) {
        setBounties(data);
      }
    }

    loadBounties();

    const channel = supabase
      .channel("realtime-bounties")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bounties" },
        (payload) => {
          setBounties((prev) => upsertBounty(prev, payload.new));
          setCurrentPage(1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bounties" },
        (payload) => {
          setBounties((prev) => upsertBounty(prev, payload.new));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(bounties.length / PAGE_SIZE));

  const paginatedBounties = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return bounties.slice(start, start + PAGE_SIZE);
  }, [bounties, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-secondary bg-secondary/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Open Bounties
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{openCount}</p>
        </div>

        <div className="rounded-2xl border border-secondary bg-secondary/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Solved Tasks
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{solvedCount}</p>
        </div>

        <div className="rounded-2xl border border-secondary bg-secondary/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <Coins className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Sats Paid Out
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">
            {totalSatsPaid.toLocaleString()}
          </p>
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
        <>
          <ul className="grid gap-4">
          {paginatedBounties.map((bounty) => {
            const isSolved = bounty.status === "solved";

            return (
              <li
                key={bounty.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  isSolved
                    ? "pointer-events-none border-secondary bg-secondary/30 opacity-60 grayscale"
                    : "border-secondary bg-secondary/30"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-medium leading-6 text-foreground">
                          {bounty.task_description}
                        </p>
                        {isSolved ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Solved
                          </span>
                        ) : null}
                      </div>

                      {isSolved && bounty.solution ? (
                        <p className="mt-2 rounded-xl border border-secondary bg-background/70 p-3 text-sm text-accent">
                          {bounty.solution}
                        </p>
                      ) : null}
                    </div>

                    <p className="text-2xl font-bold text-primary sm:flex-shrink-0">
                      {bounty.bounty_sats} sats
                    </p>
                  </div>

                  {!isSolved ? (
                    <form
                      action={async (formData) => {
                        await solveBounty(formData);
                      }}
                      className="grid gap-3"
                    >
                      <input type="hidden" name="bountyId" value={bounty.id} />
                      <textarea
                        name="solution"
                        required
                        rows={3}
                        placeholder="Describe your solution..."
                        className="w-full rounded-xl border border-secondary bg-background px-4 py-3 text-sm text-foreground outline-none ring-primary/30 placeholder:text-accent focus:ring-2"
                      />
                      <input
                        type="text"
                        name="lightningAddress"
                        required
                        placeholder="yourname@getalby.com"
                        className="w-full rounded-xl border border-secondary bg-background px-4 py-3 text-sm text-foreground outline-none ring-primary/30 placeholder:text-accent focus:ring-2"
                      />
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:bg-primary/90 sm:w-auto"
                      >
                        Submit Solution & Get Paid
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-secondary bg-secondary/20 px-4 py-3">
            <p className="text-sm text-accent">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-secondary bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-secondary bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
        </>
      )}
    </section>
  );
}
