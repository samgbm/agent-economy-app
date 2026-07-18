"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Tag,
  X,
  Zap,
} from "lucide-react";
import type { ServiceWithVendor } from "@/types/database";

interface ServiceModalProps {
  service: ServiceWithVendor | null;
  onClose: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-accent">{icon}</div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-accent">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  if (!service) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl">
        <header className="border-b border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {service.title}
              </h2>
              <p className="mt-1 text-sm text-accent">
                By {service.vendor.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close service details"
              className="rounded-md border border-border p-2 text-accent transition hover:bg-secondary/50 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="space-y-8 overflow-y-auto p-6">
          <section>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricBox
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
                label="Price (Sats)"
                value={service.price_sats}
              />
              <MetricBox
                icon={<Star className="h-4 w-4 text-primary" />}
                label="Reputation Score"
                value={service.vendor.reputation_score}
              />
              <MetricBox
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                label="Staked Sats"
                value={service.vendor.staked_sats}
              />
              <MetricBox
                icon={<Activity className="h-4 w-4" />}
                label="Uptime %"
                value={`${service.uptime_percentage}%`}
              />
              <MetricBox
                icon={<Clock className="h-4 w-4" />}
                label="Avg Latency (ms)"
                value={service.avg_latency_ms}
              />
              <MetricBox
                icon={<Tag className="h-4 w-4" />}
                label="Category"
                value={service.category}
              />
              <MetricBox
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Status"
                value={service.is_active ? "Active" : "Inactive"}
              />
              <MetricBox
                icon={<Calendar className="h-4 w-4" />}
                label="Created Date"
                value={formatDate(service.created_at)}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Integration Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-accent">Endpoint</p>
                <pre className="overflow-x-auto rounded-lg border border-border bg-primary/5 p-4 font-mono text-sm text-foreground">
                  POST {service.endpoint_url}
                </pre>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-accent">
                  Payload Format
                </p>
                <pre className="overflow-x-auto rounded-lg border border-border bg-primary/5 p-4 font-mono text-sm text-foreground">
                  {JSON.stringify(service.payload_format, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex justify-end border-t border-border bg-secondary/20 p-6">
          <button
            type="button"
            onClick={() => console.log(service.id)}
            className="rounded-lg border border-primary bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Test Service (Buy Now)
          </button>
        </footer>
      </div>
    </div>
  );
}
