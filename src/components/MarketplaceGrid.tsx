"use client";

import { useEffect, useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceModal } from "@/components/ServiceModal";
import supabase from "@/lib/supabaseClient";
import type { ServiceWithVendor } from "@/types/database";

export interface MarketplaceGridFilters {
  category?: string;
  categories?: string[];
  maxPrice?: number;
  maxSats?: number;
  minSats?: number;
  minReputation?: number;
}

interface MarketplaceGridProps {
  filters?: MarketplaceGridFilters;
}

export function MarketplaceGrid({ filters = {} }: MarketplaceGridProps) {
  const [services, setServices] = useState<ServiceWithVendor[]>([]);
  const [selectedService, setSelectedService] =
    useState<ServiceWithVendor | null>(null);

  useEffect(() => {
    async function loadServices() {
      let query = supabase
        .from("services")
        .select("*, vendor:vendors!inner(*)")
        .eq("is_active", true);

      if (filters.category) {
        query = query.eq("category", filters.category);
      } else if (filters.categories && filters.categories.length > 0) {
        query = query.in("category", filters.categories);
      }

      const maxPrice = filters.maxPrice ?? filters.maxSats;
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        query = query.lte("price_sats", maxPrice);
      }

      if (filters.minSats !== undefined && !Number.isNaN(filters.minSats)) {
        query = query.gte("price_sats", filters.minSats);
      }

      if (
        filters.minReputation !== undefined &&
        !Number.isNaN(filters.minReputation)
      ) {
        query = query.gte("vendors.reputation_score", filters.minReputation);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch marketplace services:", error);
        setServices([]);
        return;
      }

      setServices((data as ServiceWithVendor[] | null) ?? []);
    }

    loadServices();
  }, [filters]);

  if (services.length === 0) {
    return (
      <>
        <div className="rounded-lg border border-border bg-secondary/30 px-6 py-16 text-center text-sm text-accent">
          No services match your criteria
        </div>
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => setSelectedService(service)}
          />
        ))}
      </div>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}
