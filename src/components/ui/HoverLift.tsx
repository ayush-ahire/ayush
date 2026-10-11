"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { DURATION, EASE, useIsDesktop } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

/**
 * A card wrapper that lifts on hover.
 *
 * Deliberately gated on `lg`. `whileHover` fires on tap as well as on hover, so
 * on a phone a card would jump every time a visitor scrolled past it —
 * distracting, and on the project grid it fights the scroll reveal. Touch
 * devices get a static card instead, plus the `:active` press state below so
 * they still get *some* response.
 *
 * The transform lives here rather than in a `hover:-translate-y-1` Tailwind
 * class because Framer Motion writes to `transform` itself; two writers on one
 * property means one silently clobbers the other. The inner wrapper exists for
 * the same reason — its `:active` scale is a different element, so it never
 * competes with Framer's transform on the parent.
 */
export function HoverLift({
  children,
  className,
  /** Pixels to rise. Kept small — enough to feel alive, not enough to float. */
  distance = 6,
  /** Scale multiplier. Defaults to no scaling, which is usually the right call. */
  scale,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  scale?: number;
}) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const interactive = isDesktop && !reduceMotion;

  return (
    <motion.div
      className={cn("h-full", className)}
      whileHover={
        interactive ? { y: -distance, ...(scale ? { scale } : {}) } : undefined
      }
      whileTap={interactive ? { y: -distance / 2, scale: 0.99 } : undefined}
      transition={{ duration: DURATION.fast, ease: EASE }}
    >
      {/*
        Touch devices never reach the two props above, so a tap on a card would
        otherwise produce no perceivable response at all. This is the
        replacement: a plain CSS press state that is active everywhere, and is
        what a phone visitor actually feels. It only ever fires while a finger
        is down, so it cannot linger the way a tap-triggered `:hover` does.
      */}
      <div className="h-full transition-transform duration-200 ease-out active:scale-[0.99]">
        {children}
      </div>
    </motion.div>
  );
}