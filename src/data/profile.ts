import { experience } from "./experience";
import { projects } from "./projects";
import { services } from "./services";
import { socials } from "./socials";
import type { Profile } from "@/types";

/**
 * Core identity of the portfolio owner.
 *
 * This file deliberately imports the other data modules rather than restating
 * their values, so a change to `projects.ts` or `experience.ts` is reflected
 * here — and in the chatbot's knowledge base — without any duplication.
 */
export const profile: Profile = {
  name: "Ayush Ahire",
  role: "Full Stack Developer",
  tagline: "I build modern web applications, AI-powered products and scalable digital experiences.",
  summary:
    "Full Stack Developer working across the modern web stack, with a focus on Next.js, TypeScript and Tailwind CSS — and a particular interest in building AI-powered products that solve real problems.",
  focusAreas: [
    "Full-Stack Development",
    "AI Products",
    "Next.js",
    "TypeScript",
    "API Design",
  ],
  contact: {
    email: "ayushahire.dev@gmail.com",
    location: "Ahmedabad, Gujarat, India",
    availability: "Open to freelance projects and full-stack roles",
  },
  socials,
};

/**
 * Technologies shown in the "Technologies" marquee and offered to the chatbot.
 *
 * Declared explicitly rather than derived from project tags: the set of
 * technologies Ayush *works with* is broader than the ones any one project
 * happens to use, and it should read as a deliberate list.
 */
export const technologies: string[] = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "Prisma",
  "MongoDB",
  "PostgreSQL",
  "Supabase",
  "REST APIs",
  "Gemini",
  "OpenRouter",
  "Git",
];

/** Human-readable labels for the education section of the chatbot context. */
export const education = experience.filter((entry) => entry.type === "education");

/** Human-readable labels for the employment section of the chatbot context. */
export const employment = experience.filter((entry) => entry.type === "work");

/** Companies, deduplicated, in the order they first appear on the timeline. */
export const companies = Array.from(
  new Set(experience.map((entry) => entry.organization)),
);

/** Projects the chatbot is allowed to describe — excludes placeholders. */
export const verifiedProjects = projects.filter((project) => !project.placeholder);

/** A single object holding every knowledge-base section the chatbot reads. */
export const knowledgeBase = {
  profile,
  technologies,
  education,
  employment,
  companies,
  projects: verifiedProjects,
  services,
  socials,
};

export type KnowledgeBase = typeof knowledgeBase;