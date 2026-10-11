"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Switches between the light and dark palettes.
 *
 * Both icons are always rendered and swapped with CSS rather than chosen in
 * JS, so the correct one is correct at first paint — the provider can't know
 * the stored theme during the server render, and gating on it would show the
 * wrong icon until hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
      className={cn(
        "grid size-11 place-items-center rounded-lg text-neutral-800 transition-colors hover:bg-black/5 hover:text-neutral-950 dark:text-muted dark:hover:bg-surface dark:hover:text-foreground",
        className,
      )}
    >
      <Sun className="size-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}