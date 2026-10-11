import { SocialLinks } from "@/components/sections/SocialLinks";
import { RevealGroup } from "@/components/ui/motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Closing social section, bridging the contact form and the footer. */
export function Socials() {
  return (
    <Section
      id="socials"
      headingId="socials-heading"
      className="border-t border-border"
    >
      <div className="container-page">
        <SectionHeading
          id="socials-heading"
          eyebrow="Elsewhere"
          title="Find me online"
          description="Code, writing and conversation — pick whichever you prefer."
          align="center"
        />

        <RevealGroup className="mx-auto mt-12 max-w-2xl">
          <SocialLinks />
        </RevealGroup>
      </div>
    </Section>
  );
}