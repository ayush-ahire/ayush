/**
 * Site-wide constants.
 *
 * Single source of truth for the canonical origin and site metadata. Read at
 * build time by `app/layout.tsx`, `app/sitemap.ts` and `app/robots.ts`.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/**
 * Falls back to the Vercel-provided production origin, then to localhost, so
 * metadata generation never throws during a local build.
 */
export const SITE_URL = (
  rawSiteUrl ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE = {
  name: "Ayush Ahire",
  title: "Ayush Ahire — Full Stack Developer",
  description:
    "Full Stack Developer building modern web applications, AI-powered products and scalable digital experiences with Next.js, TypeScript and Tailwind CSS.",
  locale: "en_US",
} as const;

/** Navigation entries, in the order they appear in the navbar. */
export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

export const CTA_LABEL = "Let's Work Together";