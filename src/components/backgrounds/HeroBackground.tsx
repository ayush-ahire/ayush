"use client";

import MicroSlats from "@/components/backgrounds/MicroSlats";
import { useTheme } from "@/context/ThemeContext";

/**
 * WebGL background for the Hero section.
 *
 * The palette follows the active theme: near-black with purple slats in dark
 * mode, the site's off-white with the same slats in light. The values are
 * baked into the shader rather than read from CSS custom properties, so they
 * are declared here once and handed to the component.
 */
export function HeroBackground() {
  const { isDark } = useTheme();

  return (
    <div className="pointer-events-none absolute inset-0 bg-[#fafafa] dark:bg-[#120f17] transition-colors duration-300">
      <MicroSlats
        preset="swell"
        color="#A855F7"
        glintColor="#ffffff"
        backgroundColor={isDark ? "#120f17" : "#fafafa"}
        slatWidth={10}
        slatHeight={25}
        gap={3}
        roundness={0.75}
        interactive
        cursorStrength={1}
        cursorSize={40}
        swirl={0}
        trail={1.4}
        lean={0}
        intro
        scale={1.5}
        speed={0.6}
        direction={250}
        chop={0.55}
        stretch={0}
        glint={isDark ? 0.7 : 0.6}
        contrast={isDark ? 1.25 : 1.15}
        perspective={0.55}
        fog={isDark ? 0.55 : 0.4}
        introDuration={1.5}
        paused={false}
      />

      {/*
        Radial depth wash — a white lift in dark mode, a purple one in light,
        both faint enough that the canvas stays the dominant surface.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.06),transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(250,250,250,0.07),transparent_70%)]"
      />
    </div>
  );
}