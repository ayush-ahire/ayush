"use client";

import {
  Layout,
  Layers,
  Network,
  Rocket,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useTheme } from "@/context/ThemeContext";
import { DURATION, EASE, useIsDesktop } from "@/components/ui/motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

import type { Service } from "@/types";

/**
 * Icon registry for the services grid.
 *
 * `Service.icon` holds a string key rather than a component reference so the
 * data files stay plain, serialisable modules that could be fetched or moved
 * later. Unknown keys fall back to a neutral icon rather than crashing.
 */
const ICONS: Record<string, LucideIcon> = {
  Layout,
  Layers,
  Sparkles,
  Network,
  Rocket,
  Wrench,
};

export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const interactive = isDesktop && !reduceMotion;
  const { theme } = useTheme();
  const Icon = ICONS[service.icon] ?? Sparkles;

  return (
    <SpotlightCard
      /*
        The light is the theme's own foreground colour, so it reads as a
        highlight rather than a coloured glow — which is what keeps it inside
        this palette. Light mode gets the weaker fill because a dark light on a
        pale surface would otherwise read as a smudge.
      */
      theme={theme}
      intensity={0.11}
      spotlightSize={300}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors duration-300 group-hover:border-border-strong"
      >
        {/*
          The icon leans into the hover rather than spinning — a rotation here
          would read as decoration on a grid of six identical cards.
        */}
        <motion.span
          className="flex"
          initial={false}
          whileHover={interactive ? { y: -3, scale: 1.05 } : undefined}
          transition={{ duration: DURATION.fast, ease: EASE }}
        >
          <Icon className="size-5" />
        </motion.span>
      </span>

      <h3 className="text-lg font-medium tracking-tight">{service.title}</h3>

      <p className="text-sm leading-relaxed text-muted text-pretty">
        {service.description}
      </p>

      {service.technologies && service.technologies.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {service.technologies.map((technology) => (
            <li
              key={technology}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-subtle transition-colors duration-200 group-hover:border-border-strong group-hover:text-muted"
            >
              {technology}
            </li>
          ))}
        </ul>
      ) : null}
    </SpotlightCard>
  );
}