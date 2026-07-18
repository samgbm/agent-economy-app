"use client";

import { Filter, Search, Star, Zap } from "lucide-react";
import { useState } from "react";

const categories = [
  "Data Analysis",
  "Creative/Art",
  "Smart Contracts",
  "Entertainment",
];

export function SidebarFilter() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minSats, setMinSats] = useState("5");
  const [maxSats, setMaxSats] = useState("500");
  const [minReputation, setMinReputation] = useState("50");

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function handleApplyFilters() {
    console.log("[SidebarFilter] Applied filters:", {
      categories: selectedCategories,
      minSats: Number(minSats),
      maxSats: Number(maxSats),
      minReputation: Number(minReputation),
    });
  }

  return (
    <aside className="h-fit border-border pr-6 md:border-r">
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
        <Filter className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          Faceted Search
        </h2>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-accent" />
          Categories
        </div>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category}>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {category}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8 border-t border-border pt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Zap className="h-4 w-4 text-accent" />
          Price Range (sats)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-accent">
            Min Sats
            <input
              type="number"
              min={0}
              value={minSats}
              onChange={(event) => setMinSats(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/20 focus:ring-2"
            />
          </label>
          <label className="text-xs text-accent">
            Max Sats
            <input
              type="number"
              min={0}
              value={maxSats}
              onChange={(event) => setMaxSats(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/20 focus:ring-2"
            />
          </label>
        </div>
      </div>

      <div className="mb-8 border-t border-border pt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Star className="h-4 w-4 text-accent" />
          Minimum Reputation
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={minReputation}
          onChange={(event) => setMinReputation(event.target.value)}
          className="w-full accent-primary"
        />
        <p className="mt-2 text-xs text-accent">
          Minimum Reputation:{" "}
          <span className="font-medium text-foreground">{minReputation}</span> /
          100
        </p>
      </div>

      <button
        type="button"
        onClick={handleApplyFilters}
        className="w-full rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        Apply Filters
      </button>
    </aside>
  );
}
