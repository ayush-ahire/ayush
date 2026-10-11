"use client";

import { BrandIcon } from "@/components/icons/BrandIcon";
import { HoverLift } from "@/components/ui/HoverLift";
import { RevealItem, socialReveal } from "@/components/ui/motion";

import { socials } from "@/data/socials";
import type { SocialLink } from "@/types";

/**
 * A single social profile link.
 *
 * `target="_blank"` is paired with `rel="noopener noreferrer"` so the opened
 * page cannot reach back into this one via `window.opener`.
 *
 * The visible label is the platform name, so the icon is decorative and the
 * link is understandable without it.
 */
function SocialLinkCard({ social }: { social: SocialLink }) {
  return (
    <HoverLift distance={4} className="rounded-2xl">
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-300 hover:border-border-strong hover:bg-surface-raised"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors group-hover:border-border-strong"
          >
            <BrandIcon platform={social.platform} className="size-4.5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium">{social.label}</span>
            {social.handle ? (
              <span className="text-xs text-subtle">{social.handle}</span>
            ) : null}
          </span>
        </span>

        {/*
          The nudge is a CSS transform rather than a Framer Motion variant:
          `HoverLift` hands its parent a `whileHover` object, not a variant
          label, so a child variant named "hover" would never be selected. The
          transform lives here rather than on the card for the same reason —
          Framer Motion owns `transform` on the card itself.
        */}
        <span
          aria-hidden="true"
          className="text-subtle transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </a>
    </HoverLift>
  );
}

/**
 * The social links grid.
 *
 * Reads entirely from `data/socials.ts`, so adding or changing a profile is a
 * one-line edit there.
 *
 * A Client Component so the cards can stagger in on scroll. The parent
 * `<RevealGroup>` in `Socials.tsx` supplies the trigger and the inherited
 * "visible" state — these items read their variant from it rather than
 * animating on mount, which would play out while the section is still below
 * the fold.
 */
export function SocialLinks() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {socials.map((social) => (
        <RevealItem
          key={social.platform}
          variants={socialReveal}
          className="h-full"
        >
          <SocialLinkCard social={social} />
        </RevealItem>
      ))}
    </ul>
  );
}