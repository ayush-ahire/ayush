"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { EASE, fadeUp, staggerContainer } from "@/components/ui/motion";
import { TextType } from "@/components/ui/TextType";
import { profile } from "@/data/profile";

/**
 * The left column of the hero.
 *
 * Isolated as a Client Component so only this block — not the whole section —
 * hydrates. The entrance is a single staggered sequence; with reduced motion
 * every element renders in its final position with no transform or opacity
 * change, so the hero is fully legible the moment it paints.
 */
export function HeroIntro() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainer}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      className="relative isolate flex flex-col items-start gap-6"
    >
      {/* Subtle legibility wash for light mode: keeps moving slats visible while making typography pop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.65)_45%,transparent_80%)] blur-md dark:hidden"
      />

      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-300/80 bg-white/95 px-3 py-1.5 font-mono text-[11px] sm:text-xs font-medium text-neutral-800 shadow-xs backdrop-blur-md dark:border-border dark:bg-surface dark:font-normal dark:text-muted dark:shadow-none"
      >
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-success" />
        {profile.contact.availability}
      </motion.p>

      <motion.h1
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-4xl font-semibold tracking-tight text-balance text-neutral-950 sm:text-5xl lg:text-6xl dark:text-foreground"
      >
        {/*
          The name types once and then stops — no loop, and the caret retires
          with it so nothing on the page keeps moving after the first second.
          It carries the page's only <h1>, so the full string is also present as
          screen-reader text; an empty heading would be what crawlers and
          unfurlers read.
        */}
        <TextType text={profile.name} speed={70} startOnVisible />
      </motion.h1>

      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl dark:text-white"
      >
        {profile.role}
      </motion.p>

      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="max-w-xl text-base sm:text-lg font-semibold leading-relaxed text-neutral-950 text-pretty dark:text-white"
      >
        {profile.tagline}
      </motion.p>

      <motion.ul
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap gap-2 pt-1"
      >
        {profile.focusAreas.map((area) => (
          <li
            key={area}
            className="rounded-full border border-neutral-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-xs backdrop-blur-sm dark:border-border dark:bg-surface dark:font-normal dark:text-muted dark:shadow-none"
          >
            {area}
          </li>
        ))}
      </motion.ul>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col gap-3 pt-3 sm:flex-row"
      >
        <ButtonLink href="#projects" size="lg" className="shadow-xs">
          View Projects
        </ButtonLink>
        <ButtonLink
          href="#contact"
          variant="secondary"
          size="lg"
          className="border-neutral-300 bg-white/95 text-neutral-900 shadow-xs hover:bg-white hover:border-neutral-400 dark:border-border-strong dark:bg-surface dark:text-foreground dark:hover:bg-surface-raised"
        >
          Let&apos;s Work Together
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </motion.div>
    </motion.div>
  );
}