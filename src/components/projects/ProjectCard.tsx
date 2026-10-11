"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandIcon } from "@/components/icons/BrandIcon";
import { DURATION, EASE, useIsDesktop } from "@/components/ui/motion";

import type { Project } from "@/types";
import { cn } from "@/lib/utils";

/**
 * One project card.
 *
 * Projects without artwork render a generated tile with the project's initials
 * rather than an empty grey box — it keeps the grid visually even now, and
 * gives the placeholders a deliberate look instead of looking broken.
 *
 * The lift itself lives in `<HoverLift>` in the parent grid; this component owns
 * the effects that belong to the card's own parts — the artwork zoom and the
 * link nudges — so they can key off the same `group` hover without Framer
 * Motion and a Tailwind class both writing to `transform`.
 */
export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const interactive = isDesktop && !reduceMotion;

  const initials = project.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-border-strong hover:bg-surface-raised",
        project.placeholder && "border-dashed",
        className,
      )}
    >
      {/* Artwork. `overflow-hidden` on the frame keeps the zoomed image from
          ever escaping the card. */}
      <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-surface-raised">
        {project.image ? (
          <motion.div
            className="absolute inset-0"
            initial={false}
            whileHover={interactive ? { scale: 1.05 } : undefined}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Image
              src={project.image}
              alt={`Screenshot of ${project.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_120%_at_50%_0%,rgba(250,250,250,0.05),transparent_60%)]"
          >
            <span className="font-mono text-4xl font-semibold text-subtle/60">
              {initials}
            </span>
          </div>
        )}

        {project.category ? (
          <span className="absolute top-3 left-3 rounded-full border border-border-strong bg-background/80 px-2.5 py-1 font-mono text-[11px] text-muted backdrop-blur-sm">
            {project.category}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-medium tracking-tight">{project.name}</h3>

        <p className="text-sm leading-relaxed text-muted text-pretty">
          {project.description}
        </p>

        {project.technologies.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-subtle transition-colors duration-200 group-hover:border-border-strong group-hover:text-muted"
              >
                {technology}
              </li>
            ))}
          </ul>
        ) : null}

        {project.links.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-4 pt-3">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <motion.span
                  className="flex"
                  initial={false}
                  whileHover={interactive ? { x: 4 } : undefined}
                  transition={{ duration: DURATION.fast, ease: EASE }}
                >
                  {link.label === "Source Code" ? (
                    <BrandIcon platform="github" className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  )}
                </motion.span>
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}