import { Mail, MapPin } from "lucide-react";

import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/ui/motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";

/**
 * Contact section.
 *
 * Split asymmetrically on desktop: the heading and direct contact details on
 * the left, the form on the right. The details are real `mailto:`/text links
 * so the section stays useful even if the form or the mail provider is down.
 */
export function Contact() {
  return (
    <Section id="contact" headingId="contact-heading" className="border-t border-border">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="contact-heading"
            eyebrow="Contact"
            title="Let's build something together."
            description="Have a project in mind? Let's talk."
          />

          <Reveal delay={0.1}>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="group flex items-center gap-3 text-sm text-muted transition-colors hover:text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface transition-colors group-hover:border-border-strong"
                  >
                    <Mail className="size-4" />
                  </span>
                  {/*
                    `min-w-0` lets this flex item shrink below its content size
                    and `break-all` gives an address with no spaces somewhere to
                    break. Without both, the row's default `min-width: auto`
                    keeps the email at full width and a longer address would
                    scroll the page sideways at 320px.
                  */}
                  <span className="min-w-0 break-all">{profile.contact.email}</span>
                </a>
              </li>

              <li className="flex items-center gap-3 text-sm text-muted">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface"
                >
                  <MapPin className="size-4" />
                </span>
                {profile.contact.location}
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}