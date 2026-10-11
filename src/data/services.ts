import type { Service } from "@/types";

/** Services offered to clients and freelancers. */
export const services: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Modern, responsive websites and web applications built to load fast and work everywhere.",
    icon: "Layout",
    technologies: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    id: "full-stack-development",
    title: "Full-Stack Development",
    description:
      "Complete frontend, backend, database, API and authentication development — from data model to deployed product.",
    icon: "Layers",
    technologies: ["TypeScript", "Node.js", "PostgreSQL", "MongoDB"],
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    description:
      "Integrating AI capabilities into existing applications and building AI-powered products end to end.",
    icon: "Sparkles",
    technologies: ["OpenRouter", "Gemini", "LLM APIs"],
  },
  {
    id: "api-development",
    title: "API Development",
    description:
      "REST APIs, authentication, database integration and third-party API integrations, designed to be maintained.",
    icon: "Network",
    technologies: ["REST", "Next.js Route Handlers", "OAuth"],
  },
  {
    id: "deployment-hosting",
    title: "Website Deployment & Hosting",
    description:
      "Deployment, configuration and hosting of modern web applications on production infrastructure.",
    icon: "Rocket",
    technologies: ["Vercel", "CI/CD", "Environment Config"],
  },
  {
    id: "maintenance",
    title: "Website Maintenance",
    description:
      "Bug fixing, improvements, feature development and performance optimisation for live products.",
    icon: "Wrench",
    technologies: ["Bug Fixing", "Refactoring", "Performance"],
  },
];