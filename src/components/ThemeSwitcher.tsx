"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { AppTheme } from "./ThemeProvider";

const themes: { value: AppTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "agora", label: "Agora" },
  { value: "colosseum", label: "Colosseum" },
  { value: "indies", label: "Indies" },
  { value: "dev3pack", label: "Dev3pack" },
  { value: "ai-scientist", label: "AI Scientist" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = themes.find((item) => item.value === theme) ?? themes[0];

  if (!mounted) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-secondary bg-background px-3 py-2 text-sm text-foreground opacity-0"
        aria-hidden
      >
        <Palette className="size-4" />
        <span>Theme</span>
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 rounded-lg border border-secondary bg-background/90 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur">
      <Palette className="size-4 shrink-0 text-accent" aria-hidden />
      <span className="sr-only">Theme</span>
      <select
        aria-label="Select theme"
        className="cursor-pointer bg-transparent text-foreground outline-none"
        value={currentTheme.value}
        onChange={(event) => setTheme(event.target.value)}
      >
        {themes.map((item) => (
          <option className="cursor-pointer bg-background/90 text-foreground outline-none" key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
