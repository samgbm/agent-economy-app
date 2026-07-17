import { Bot, Zap } from "lucide-react";
import { RevenueTracker } from "@/components/RevenueTracker";
import { TransactionFeed } from "@/components/TransactionFeed";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16 sm:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-secondary bg-secondary/30 p-8 sm:p-10">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Lightning L402
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Agent Economy API Dashboard
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-accent sm:text-lg">
                Monitor autonomous agents as they pay sats, unlock premium API
                endpoints, and stream verified transactions in real time.
              </p>
            </div>

            <div className="rounded-2xl border border-secondary bg-background/80 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary p-3 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Agent Service API
                  </p>
                  <p className="text-xs text-accent">10 sats per request</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RevenueTracker />
        <TransactionFeed />
      </main>
    </div>
  );
}
