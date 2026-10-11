import type { TimelineEntry } from "@/types";

/**
 * Career timeline, ordered oldest first.
 *
 * Edit this array to change the Journey section and the chatbot's answers
 * about work experience — nothing else needs to change.
 */
export const experience: TimelineEntry[] = [
  {
    id: "mca",
    type: "education",
    title: "Master of Computer Applications (MCA)",
    organization: "Parul University",
    period: "Postgraduate degree",
    startDate: "2022-08",
    summary:
      "Postgraduate studies in computer applications, building the formal foundation in programming, data structures, databases and software engineering that the rest of the career builds on.",
    highlights: [
      "Advanced study of programming, data structures and database systems",
      "Web technologies and software engineering fundamentals",
    ],
  },
  {
    id: "wind-hans-trainee",
    type: "work",
    title: "Trainee Developer",
    organization: "Wind Hans Technologies",
    period: "May 2025 — June 2025",
    startDate: "2025-05",
    endDate: "2025-06",
    summary:
      "Joined as a trainee to move from academic work into a professional delivery environment — learning a real codebase, a real review process and real deadlines.",
    highlights: [
      "Onboarded into an existing codebase and learned the team's development workflow",
      "Completed structured training across the company's core web stack",
    ],
    stack: ["Next.js", "JavaScript"],
  },
  {
    id: "wind-hans-fullstack",
    type: "work",
    title: "Full Stack Developer",
    organization: "Wind Hans Technologies",
    period: "June 2025 — July 2026",
    startDate: "2025-06",
    endDate: "2026-07",
    summary:
      "Promoted from trainee to full-time developer and owned features end to end — interface, API, data model and deployment — across the company's client web applications.",
    highlights: [
      "Built and shipped features across the full stack, from UI through to database and API",
      "Worked within a professional code review and release process",
      "Progressed from trainee to full-time developer within roughly one month",
    ],
    stack: ["Next.js", "React", "Node.js", "MongoDB", "Tailwind CSS"],
  },
  {
    id: "technouse",
    type: "work",
    title: "Full Stack Developer",
    organization: "Technouse Pvt Ltd",
    location: "Ahmedabad, Gujarat",
    period: "2026 — Present",
    startDate: "2026-01",
    current: true,
    summary:
      "Joined Technouse as a full stack developer, applying the end-to-end experience built at Wind Hans to client delivery in a product-focused team.",
    highlights: [
      "Delivering full-stack features across frontend, backend and data layers",
      "Working with client teams to turn requirements into working, maintainable software",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
  },
];