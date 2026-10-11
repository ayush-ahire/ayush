/**
 * Shared domain types for the portfolio.
 *
 * These describe the shape of the structured data files in `src/data`, which
 * are the single source of truth for every piece of content rendered on the
 * site and consumed by the AI chatbot.
 */

export type SocialPlatform = "github" | "twitter" | "telegram" | "reddit";

export interface SocialLink {
  /** Machine key, also used as the React list key. */
  platform: SocialPlatform;
  /** Human-readable label used for the accessible name of the link. */
  label: string;
  /** Absolute URL to the profile. */
  href: string;
  /** Short handle shown next to the icon, e.g. "@ayush". */
  handle?: string;
}

/**
 * One entry in the career timeline. Education entries use `type: "education"`,
 * employment entries use `type: "work"`.
 */
export interface TimelineEntry {
  id: string;
  type: "work" | "education";
  /** Role held, or the degree awarded. */
  title: string;
  /** Organisation or institution. */
  organization: string;
  /** Optional location, e.g. "Ahmedabad, Gujarat". */
  location?: string;
  /** Display string for the period, e.g. "June 2025 — July 2026". */
  period: string;
  /** Machine-readable sort key, "YYYY-MM". Used to order entries. */
  startDate: string;
  /** Present for the current role; omitted once it has ended. */
  endDate?: string;
  /** Present only for the role Ayush holds now. */
  current?: boolean;
  summary: string;
  /** Bullet points describing scope and responsibilities. */
  highlights: string[];
  /** Short stack descriptor shown as a pill on the timeline. */
  stack?: string[];
}

export interface ProjectLink {
  label: "Live Demo" | "Source Code";
  href: string;
}

export interface Project {
  id: string;
  name: string;
  /** One-line summary used on the card and in chatbot context. */
  description: string;
  /**
   * Path under `public/`, e.g. "/images/projects/recipe-generator.webp".
   * Projects without artwork set this to null and render a generated
   * gradient tile instead.
   */
  image: string | null;
  technologies: string[];
  links: ProjectLink[];
  /** Optional grouping, e.g. "AI" or "Full Stack". */
  category?: string;
  /**
   * Marks a card that is a deliberate visual placeholder rather than real
   * work. Placeholders are never described to the chatbot as shipped projects.
   */
  placeholder?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Key of a Lucide icon component, resolved in the services section. */
  icon: string;
  technologies?: string[];
}

export interface ContactInfo {
  email: string;
  location: string;
  availability: string;
}

export interface Profile {
  name: string;
  role: string;
  /** Short positioning line used in the hero and SEO description. */
  tagline: string;
  /** One-paragraph professional summary. */
  summary: string;
  /** Areas of focus rendered as pills under the hero introduction. */
  focusAreas: string[];
  contact: ContactInfo;
  socials: SocialLink[];
}