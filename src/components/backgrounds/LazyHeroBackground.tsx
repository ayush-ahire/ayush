"use client";

import dynamic from "next/dynamic";

/**
 * Deferred entry point for the hero's WebGL background.
 *
 * The canvas is decorative — `pointer-events-none`, and every word in the hero
 * is server-rendered independently of it — so there is nothing to lose by
 * letting it arrive after first paint. What it buys is the critical path:
 * `ogl` and the twelve GLSL shader strings in `MicroSlats` are the largest
 * assets on the page, and importing them eagerly put them in the initial HTML
 * where they blocked hydration on low-end devices.
 *
 * The split has to be set up *here*, in a client module, rather than at the
 * call site. `Hero` is a Server Component, and per the Next.js lazy-loading
 * guide a Server Component cannot code-split a dynamic import of a Client
 * Component, nor pass `ssr: false` — both error outright.
 *
 * `loading` paints the same two background colours `HeroBackground` uses, so
 * the swap is invisible: there is no flash of an unpainted hero while ogl
 * downloads and the fluid simulation compiles its shaders.
 *
 * `HeroBackground` reads the theme from context itself, so it stays the single
 * source of truth for the palette — this wrapper deliberately passes no props.
 */
const HeroBackground = dynamic(
  () =>
    import("@/components/backgrounds/HeroBackground").then((m) => m.HeroBackground),
  {
    ssr: false,
    loading: () => (
      <div className="pointer-events-none absolute inset-0 bg-[#fafafa] dark:bg-[#120f17]" />
    ),
  },
);

/** The hero background, deferred until after first paint. */
export function LazyHeroBackground() {
  return <HeroBackground />;
}
