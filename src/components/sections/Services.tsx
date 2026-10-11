import { ServiceCard } from "@/components/services/ServiceCard";
import { HoverLift } from "@/components/ui/HoverLift";
import { RevealGroup, RevealItem, serviceReveal } from "@/components/ui/motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";

/** What Ayush offers to clients and collaborators. */
export function Services() {
  return (
    <Section id="services" headingId="services-heading" className="border-t border-border">
      <div className="container-page">
        <SectionHeading
          id="services-heading"
          eyebrow="Services"
          title="What I can build for you"
          description="From a single landing page to a complete full-stack product — including the AI layer."
        />

        <RevealGroup
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          amount={0.2}
        >
          {services.map((service) => (
            <RevealItem key={service.id} variants={serviceReveal} className="h-full">
              <HoverLift distance={5}>
                <ServiceCard service={service} className="h-full" />
              </HoverLift>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}