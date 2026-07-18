"use client";

import { Activity, Star, Zap } from "lucide-react";
import type { ServiceWithVendor } from "@/types/database";

interface ServiceCardProps {
  service: ServiceWithVendor;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="cursor-pointer rounded-lg border border-border bg-background p-5 shadow-sm transition-colors hover:bg-secondary/50">
      <span className="inline-block rounded-md border border-border bg-secondary/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        {service.category}
      </span>

      <div className="mt-4">
        <h3 className="text-base font-bold text-foreground">{service.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-accent">
          {service.description}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
        <Star className="h-4 w-4 text-primary" />
        <span className="font-medium">{service.vendor.name}</span>
        <span className="text-accent">· {service.vendor.reputation_score}</span>
      </div>

      <footer className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Zap className="h-4 w-4 text-yellow-500" />
          {service.price_sats} sats
        </div>
        <div className="flex items-center gap-2 text-accent">
          <Activity className="h-4 w-4" />
          {service.uptime_percentage}% uptime
        </div>
      </footer>
    </article>
  );
}
