"use client";

import { ShieldAlert, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export function DemoToggle() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function loadDemoMode() {
      const { data, error } = await supabase
        .from("app_settings")
        .select("demo_mode")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Failed to fetch demo mode setting:", error);
        return;
      }

      setIsDemoMode(Boolean(data?.demo_mode));
    }

    loadDemoMode();
  }, []);

  async function toggleDemoMode() {
    setIsDemoMode((current) => !current);

    const { error } = await supabase
      .from("app_settings")
      .update({ demo_mode: !isDemoMode })
      .eq("id", 1);

    if (error) {
      console.error("Failed to update demo mode:", error);
      setIsDemoMode((current) => !current);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleDemoMode}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        isDemoMode
          ? "border-accent bg-accent text-background shadow-[0_0_20px_-4px_var(--accent)]"
          : "border-secondary bg-background/90 text-foreground hover:bg-secondary/60"
      }`}
    >
      {isDemoMode ? (
        <ShieldAlert className="h-4 w-4" />
      ) : (
        <Zap className="h-4 w-4 text-primary" />
      )}
      {isDemoMode ? "Demo Mode: ON" : "Demo Mode: OFF"}
    </button>
  );
}
