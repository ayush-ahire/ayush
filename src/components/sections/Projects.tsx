import { ProjectCard } from "@/components/projects/ProjectCard";
import { HoverLift } from "@/components/ui/HoverLift";
import { cardReveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";

/**
 * Project showcase.
 *
 * A Server Component — the cards are static markup, so the whole grid is
 * rendered in the initial HTML and is crawlable and interactive without
 * JavaScript.
 */
export function Projects() {
  return (
    <Section id="projects" headingId="projects-heading" className="border-t border-border">
      <div className="container-page">
        <SectionHeading
          id="projects-heading"
          eyebrow="Selected work"
          title="Projects"
          description="Products built across AI and full-stack development — from idea to deployment."
        />

        <RevealGroup
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          amount={0.2}
        >
          {projects.map((project) => (
            <RevealItem key={project.id} variants={cardReveal} className="h-full">
              <HoverLift scale={1.01}>
                <ProjectCard project={project} className="h-full" />
              </HoverLift>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}