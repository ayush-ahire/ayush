"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Shared motion primitives.
 *
 * Every animation on the site comes from here, which keeps timing and easing
 * consistent and makes the reduced-motion contract enforceable in one file.
 *
 * Sections are given *different* variants rather than one repeated fade-up, so
 * the page has a motion identity per section while still reading as one system.
 * Everything animates only `transform` and `opacity`, which the compositor
 * handles off the main thread.
 */

/** Standard easing — a gentle decelerate that reads as "settling", not bouncing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Timing scale, kept in one place so sections feel related.
 *
 * Interactions are quicker than reveals by design: a hover should answer the
 * pointer immediately, while a section reveal is allowed to take its time.
 */
export const DURATION = {
  /** Hover, press, and other direct responses. */
  fast: 0.2,
  /** Panels, cards, menus. */
  normal: 0.35,
  /** Full section reveals. */
  section: 0.6,
} as const;

/** Fade and rise slightly. The default for text blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Fade only, for text that should not appear to move. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scale in slightly — used for the chatbot card. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/**
 * Journey: entries slide in from the side they sit on, so the timeline reads
 * as alternating rather than as a single column marching downward.
 */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Projects: a small lift plus scale, so cards feel like they arrive forward
 * rather than sliding past.
 */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/** Services: scales from slightly further back, with less vertical travel. */
export const serviceReveal: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/** Socials: a short rise, quiet enough not to compete with the section title. */
export const socialReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Parent wrapper that staggers its children on scroll into view. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Alias for readability at call sites that aren't named "RevealItem". */
export const staggerItem = fadeUp;

/**
 * Props shared by every scroll-reveal wrapper.
 *
 * `once` keeps elements settled after their first reveal so scrolling back up
 * doesn't replay the whole sequence.
 */
const revealDefaults = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, margin: "-80px" },
};

/**
 * Tracks a CSS media query.
 *
 * `useSyncExternalStore` rather than a `useState` + `useEffect` pair: the
 * media query list is an external store, this hook subscribes to it, and the
 * hook gives React the exact server snapshot during SSR so the first client
 * render matches the server HTML. An effect-based version would either set
 * state synchronously on mount (a cascading render, which the lint rule
 * correctly flags) or briefly render the wrong hover behaviour on desktop.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    // Client snapshot. `matchMedia` is safe to call during render here because
    // useSyncExternalStore only reads it after hydration.
    () => window.matchMedia(query).matches,
    // Server snapshot: assume the smallest screen, so nothing animates on
    // touch devices until the client corrects it.
    () => false,
  );
}

/**
 * True at Tailwind's `lg` breakpoint and above.
 *
 * Used to keep large horizontal travel off small screens — on a phone a 40px
 * slide is a swipe, not a reveal.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/**
 * A block that fades up when scrolled into view.
 *
 * When the visitor prefers reduced motion, content renders in its final state
 * immediately — no transform, no opacity change, nothing to animate.
 */
export function Reveal({
  children,
  delay = 0,
  variants = fadeUp,
  className,
}: {
  children: ReactNode;
  delay?: number;
  variants?: Variants;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{ duration: DURATION.section, ease: EASE, delay }}
      {...revealDefaults}
    >
      {children}
    </motion.div>
  );
}

/**
 * A container that staggers its `<RevealItem>` children into view.
 *
 * Pass `stagger` to tune the gap, and `amount` to control how much of the
 * container must be visible before the sequence starts — a tall grid needs a
 * lower amount than a short row, or its last cards reveal late.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  amount,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      {...revealDefaults}
      viewport={{ once: true, margin: "-80px", amount }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A child of `<RevealGroup>`.
 *
 * Reads its variant from the parent via Framer Motion's variant inheritance,
 * so no per-item delay has to be threaded through by hand.
 */
export function RevealItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{ duration: DURATION.section, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}