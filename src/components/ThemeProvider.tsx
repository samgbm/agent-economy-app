"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

const themes = [
  "light",
  "dark",
  "agora",
  "colosseum",
  "indies",
  "dev3pack",
] as const;

export type AppTheme = (typeof themes)[number];

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={[...themes]}
    >
      {children}
    </NextThemesProvider>
  );
}
