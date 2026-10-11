import type { Project } from "@/types";

/**
 * Project showcase.
 *
 * Add or edit entries here; the grid, cards and chatbot context all read from
 * this array. Projects marked `placeholder: true` render as "coming soon"
 * cards and are excluded from the chatbot's verified knowledge.
 */
export const projects: Project[] = [
  {
    id: "ai-recipe-generator",
    name: "AI Recipe Generator",
    description:
      "An AI-powered application that generates recipes based on the ingredients you already have.",
    image: null,
    technologies: ["Next.js", "AI", "Tailwind CSS", "MongoDB"],
    links: [],
    category: "AI",
  },
  {
    id: "inkforge-ai-resume-builder",
    name: "InkForge AI Resume Builder",
    description:
      "An AI-powered resume builder focused on creating customisable, ATS-friendly resumes.",
    image: null,
    technologies: ["Next.js", "Node.js", "MongoDB", "Gemini"],
    links: [],
    category: "AI",
  },
  {
    id: "notice-board",
    name: "Notice Board",
    description:
      "A full-stack notice management application with CRUD functionality and image uploads.",
    image: null,
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Supabase", "Tailwind CSS"],
    links: [],
    category: "Full Stack",
  },
  {
    id: "coming-soon-1",
    name: "Next Project",
    description: "A further project is in progress and will be added here shortly.",
    image: null,
    technologies: [],
    links: [],
    placeholder: true,
  },
  {
    id: "coming-soon-2",
    name: "Next Project",
    description: "A further project is in progress and will be added here shortly.",
    image: null,
    technologies: [],
    links: [],
    placeholder: true,
  },
];