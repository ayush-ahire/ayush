import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Socials } from "@/components/sections/Socials";
import { profile } from "@/data/profile";
import { SITE_URL } from "@/data/site";

/**
 * The single portfolio page.
 *
 * Statically rendered — all content comes from local data, so there is nothing
 * to fetch at request time. This keeps the page fully crawlable and fast, and
 * means the chat and contact endpoints are the only dynamic parts of the site.
 */
export default function Home() {
  /**
   * JSON-LD structured data.
   *
   * Only facts actually in the knowledge base are asserted — no invented
   * credentials, ratings or affiliations. The `<` escaping follows the
   * Next.js guide so a stray character in the data can never close the script
   * tag early.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.summary,
    url: SITE_URL,
    email: `mailto:${profile.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    knowsAbout: profile.focusAreas,
    sameAs: profile.socials.map((social) => social.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main>
        <Hero />
        <Journey />
        <Projects />
        <Services />
        <Contact />
        <Socials />
      </main>
    </>
  );
}