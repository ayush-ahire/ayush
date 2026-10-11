"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DURATION, EASE } from "@/components/ui/motion";

import { experience } from "@/data/experience";
import type { TimelineEntry } from "@/types";
import { cn } from "@/lib/utils";

/**
 * A single node on the vertical career timeline.
 *
 * The connecting line is a real element rather than a pseudo-element on the
 * marker, because Framer Motion cannot animate a pseudo-element — the line has
 * to grow from the top down as the section enters, and only a real node can be
 * handed a transform.
 *
 * The line spans its own row plus the `space-y-10` gap below it, so segments
 * meet the next marker exactly without hardcoding entry heights.
 */
function TimelineItem({
  entry,
  isLast,
  index,
}: {
  entry: TimelineEntry;
  isLast: boolean;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const isEducation = entry.type === "education";
  const Icon = isEducation ? GraduationCap : Briefcase;

  /*
   * The entry travels in from the side it sits on on desktop, and rises straight
   * from below on mobile, where horizontal travel would read as a swipe rather
   * than a reveal.
   *
   * Both behaviours come from one animated element reading CSS custom
   * properties for its start offsets (see `globals.css`). Deciding the
   * direction in JavaScript instead would mean reading `matchMedia` during
   * render, which can only return the server's answer on the first client
   * pass — the start position would be locked to the mobile value before the
   * real breakpoint is known, and correcting it afterwards would jump.
   *
   * Plain objects rather than named variants for the same reason: a `variants`
   * prop re-resolves when its identity changes, which lands mid-animation and
   * strands the element between states.
   */
  return (
    <motion.li
      initial={
        reduceMotion
          ? false
          : { opacity: 0, x: "var(--timeline-x)", y: "var(--timeline-y)" }
      }
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.section, ease: EASE, delay: index * 0.08 }}
      className="timeline-entry relative grid gap-4 pl-12 sm:pl-16"
    >
      {/* Connecting line, growing downward out of this marker. */}
      {!isLast ? (
        <motion.span
          aria-hidden="true"
          initial={reduceMotion ? false : { scaleY: 0 }}
          whileInView={reduceMotion ? undefined : { scaleY: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            ease: EASE,
            // Let the line lead its own marker, so the eye follows the path
            // downward before it reaches the next entry.
            delay: 0.15 + index * 0.08,
          }}
          style={{ transformOrigin: "top" }}
          className="absolute top-9 bottom-[-2.5rem] left-[18px] w-px -translate-x-1/2 bg-border sm:top-10 sm:left-5"
        />
      ) : null}

      {/* Marker */}
      <motion.span
        aria-hidden="true"
        initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
        whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
        className={cn(
          "absolute top-1 left-0 grid size-9 place-items-center rounded-full border bg-surface sm:size-10",
          isEducation
            ? "border-border text-muted"
            : "border-border-strong text-foreground",
        )}
      >
        <Icon className="size-4" />
      </motion.span>

      <div className="flex flex-col gap-2 pb-2">
        <p className="font-mono text-xs tracking-wide text-subtle">
          {entry.period}
        </p>

        <h3 className="text-lg font-medium tracking-tight">{entry.title}</h3>

        <p className="text-sm text-muted">
          {entry.organization}
          {entry.location ? ` · ${entry.location}` : ""}
          {entry.current ? (
            <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              <span className="font-mono text-xs text-muted">Current</span>
            </span>
          ) : null}
        </p>

        <p className="max-w-2xl text-sm leading-relaxed text-muted text-pretty">
          {entry.summary}
        </p>

        {entry.highlights.length > 0 ? (
          <ul className="mt-1 space-y-1.5">
            {entry.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-2.5 text-sm leading-relaxed text-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1 shrink-0 rounded-full bg-subtle"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {entry.stack && entry.stack.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {entry.stack.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-subtle"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.li>
  );
}

/** Career and education timeline, oldest first. */
export function Journey() {
  return (
    <Section
      id="journey"
      headingId="journey-heading"
      className="border-t border-border"
    >
      <div className="container-page">
        <SectionHeading
          id="journey-heading"
          eyebrow="Journey"
          title="From coursework to production"
          description="A progression from postgraduate study into full-time engineering roles, building end-to-end ownership of features."
        />

        <ol className="mt-14 space-y-10">
          {experience.map((entry, index) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              index={index}
              isLast={index === experience.length - 1}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}