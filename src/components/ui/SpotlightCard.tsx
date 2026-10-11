"use client";

import { useEffect, useMemo, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Ported from React Bits' `SpotlightCard` (MIT), used under the attribution
 * already established by `TextType`. Three deliberate departures from upstream:
 *
 * 1. **The palette comes from this project's design tokens**, not the two
 *    hardcoded themes upstream ships. The site is strictly monochrome zinc, and
 *    a component that paints its own `#111` surface would fight every other
 *    card the moment either theme was active. Here the surface stays the
 *    caller's own `bg-*`, and only the *light* is overlaid — so the card
 *    inherits light mode/dark mode with no branching at all.
 * 2. **No ambient drift.** Upstream's `ambient` prop floats the spotlight on a
 *    sine wave when idle, which keeps a RAF alive on every card in the grid for
 *    as long as the section is on screen. This port omits that path: the
 *    animation only runs while something is actually near the card.
 * 3. **Keyboard focus is a first-class trigger.** Upstream already tracks
 *    focus, and that behaviour is kept: tabbing to a link inside the card
 *    lights it, so the effect is not hover-only — which matters both for
 *    keyboard users and for section 12's rule against hover-only interaction.
 */
type Palette = {
  light: string;
  fill: number;
  edge: number;
};

const THEMES: Record<"dark" | "light", Palette> = {
  dark: { light: "#ffffff", fill: 1, edge: 1 },
  light: { light: "#18181b", fill: 0.24, edge: 0.7 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Builds the radial-gradient's stop list for one falloff curve.
 *
 * Upstream samples 14 segments through a smoothstep core plus a Gaussian
 * "glow" term and interpolates between the two by `softness`. Both `fill` and
 * `edge` call this with the same shape, so the ramp is computed once per
 * render and shared, rather than rebuilt per frame in the paint loop.
 */
const falloff = (color: string, softness: number) => {
  const soft = clamp(softness, 0, 1);
  const core = (1 - soft) ** 1.5 * 0.85;
  const stop = (alpha: number, at: number) =>
    `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
  const list = [stop(1, 0)];
  for (let i = 0; i <= 14; i++) {
    const t = core + ((1 - core) * i) / 14;
    const g = (t - core) / (1 - core);
    const smooth = 1 - g * g * (3 - 2 * g);
    const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
    list.push(stop(smooth + (glow - smooth) * soft, t));
  }
  return list.join(", ");
};

export type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Defaults to the foreground colour of the active theme. */
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  borderGlow?: number;
  /** How far outside the card the light still reaches, in pixels. */
  proximity?: number;
  /** Higher is slower to catch up to the pointer. */
  smoothing?: number;
  /** Extra brightening while pressed. */
  flare?: boolean;
  theme?: "dark" | "light";
};

export function SpotlightCard({
  children,
  className,
  spotlightColor,
  intensity = 0.15,
  spotlightSize = 240,
  softness = 0.7,
  borderGlow = 0.6,
  proximity = 80,
  smoothing = 0.3,
  flare = true,
  theme = "dark",
  ...rest
}: SpotlightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const palette = THEMES[theme] ?? THEMES.dark;
  const color = spotlightColor ?? palette.light;

  /*
    Memoised because the two falloff curves build ~15 gradient stops each, and
    the RAF loop reads them on every frame — rebuilding them per render would
    put two string joins in the path of every pointermove.
  */
  const settings = useMemo(
    () => ({
      fill: falloff(color, softness),
      edge: falloff(color, 1),
      size: Math.max(20, spotlightSize),
      intensity: clamp(intensity, 0, 1) * palette.fill,
      borderGlow: clamp(borderGlow, 0, 1) * palette.edge,
      proximity: Math.max(0, proximity),
      smoothing: clamp(smoothing, 0, 1),
      flare,
    }),
    [color, softness, spotlightSize, intensity, borderGlow, proximity, smoothing, flare, palette.fill, palette.edge],
  );

  /*
    The animation loop is installed once and must still see the current
    settings when a prop changes, so the latest value is handed over through a
    ref — but written from an effect, since assigning during render is what
    `react-hooks/refs` flags, and correctly: render can be thrown away, and a
    ref mutated in a discarded render would leave the loop reading a value that
    was never committed.
  */
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    wakeRef.current?.();
  });

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const edge = edgeRef.current;
    if (!root || !light || !edge) return undefined;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const state = {
      x: 0,
      y: 0,
      presence: 0,
      flare: 0,
      pressed: false,
      visible: true,
    };
    const pointer = { x: 0, y: 0, active: false };
    const drawn = { light: "", edge: "" };
    let focus: Element | null = null;
    let raf = 0;
    let last = 0;
    let alive = true;

    const gradient = (
      s: typeof settings,
      size: number,
      x: number,
      y: number,
      stops: string,
    ) => `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;

    const paint = (s: typeof settings) => {
      const size = s.size * (1 + 0.2 * state.flare);
      const boost = 1 + 0.7 * state.flare;
      const fill = gradient(s, size, state.x, state.y, s.fill);
      const rim = gradient(s, size * 0.6, state.x, state.y, s.edge);

      // Writing to the DOM rather than to state is the whole reason this is
      // cheap: a `setState` here would re-render the card on every pointermove.
      if (fill !== drawn.light) {
        drawn.light = fill;
        light.style.background = fill;
      }
      if (rim !== drawn.edge) {
        drawn.edge = rim;
        edge.style.background = rim;
      }
      light.style.opacity = String(Math.min(1, state.presence * s.intensity * boost));
      edge.style.opacity = String(Math.min(1, state.presence * s.borderGlow * boost));
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const rect = root.getBoundingClientRect();

      let tx = state.x;
      let ty = state.y;
      let target = 0;

      // Keyboard focus gets the same treatment as hover, so the card still
      // reads as live when a visitor tabs to a link inside it.
      if (focus && root.contains(focus)) {
        const box = focus.getBoundingClientRect();
        tx = box.left + box.width / 2 - rect.left;
        ty = box.top + box.height / 2 - rect.top;
        target = 1;
      } else if (pointer.active) {
        tx = pointer.x - rect.left;
        ty = pointer.y - rect.top;
        const gap = Math.hypot(
          Math.max(0, -tx, tx - rect.width),
          Math.max(0, -ty, ty - rect.height),
        );
        if (gap === 0) {
          target = 1;
        } else if (s.proximity > 0) {
          // Inverse-square falloff outside the card, so the light arrives
          // rather than switching on at the edge.
          target = Math.max(0, 1 - gap / s.proximity) ** 2;
        }
      }

      // Reduced motion still gets the light, just without the smoothing that
      // makes it travel — it should appear where the pointer is, and stay.
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.22));
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;
      const fade = reduce ? 1 : 1 - Math.exp(-dt / (target > state.presence ? 0.1 : 0.32));
      state.presence += (target - state.presence) * fade;
      if (Math.abs(target - state.presence) < 0.002) state.presence = target;

      const press = state.pressed && s.flare && !reduce ? 1 : 0;
      state.flare += (press - state.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
      if (Math.abs(press - state.flare) < 0.002) state.flare = press;

      paint(s);

      // Stop the loop once everything has settled, so off-screen and untouched
      // cards cost nothing. `visible` is read but no longer gates a drift, so
      // there is no timer left to stop.
      const moving = Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1;
      const settled =
        !moving && state.presence === target && state.flare === press;
      if (!settled && state.visible) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (
        state.presence > 0 ||
        settingsRef.current.proximity > 0 ||
        root.contains(event.target as Node | null)
      ) {
        wake();
      }
    };
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.active = false;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      state.pressed = true;
      wake();
    };
    const onUp = (event: PointerEvent) => {
      // A touch pointer stops here; a mouse keeps tracking after the release.
      if (event.pointerType !== "mouse") pointer.active = false;
      if (!state.pressed && event.pointerType === "mouse") return;
      state.pressed = false;
      wake();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) {
        return;
      }
      focus = event.target;
      wake();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (root.contains(event.relatedTarget as Node | null)) return;
      focus = null;
      wake();
    };

    const observer = new IntersectionObserver((entries) => {
      state.visible = entries.some((entry) => entry.isIntersecting);
      if (state.visible) wake();
    });
    observer.observe(root);

    /*
      `pointermove` on the window rather than the card, because the card only
      wants to respond once the pointer is within `proximity` px of it — by
      which point it may already be outside the element's own bounds. The card
      still owns the down/focus listeners, so nothing here fires for a visitor
      who never approaches it.
    */
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerout", onOut);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerout", onOut);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      wakeRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative isolate overflow-hidden", className)} {...rest}>
      {/*
        Both overlays are `-z-10` so they sit behind the card's own background
        while still being clipped by it. The card therefore keeps its normal
        `bg-surface` and both themes are handled by the caller's classes alone.
      */}
      <span
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0"
      />
      <span
        ref={edgeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] p-px opacity-0 [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
      />
      {children}
    </div>
  );
}