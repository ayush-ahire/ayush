import { BrandIcon } from "@/components/icons/BrandIcon";
import { Reveal } from "@/components/ui/motion";
import { profile } from "@/data/profile";
import { NAV_LINKS } from "@/data/site";
import { socials } from "@/data/socials";

/**
 * Site footer.
 *
 * A Server Component — the year is rendered at build time, which is correct for
 * a static portfolio and avoids a hydration mismatch on New Year's Eve.
 *
 * The single reveal wrapper around the whole footer keeps this the quietest
 * animation on the site: one fade, nothing that draws attention away from the
 * content above it.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <footer className="border-t border-border">
      <Reveal
        className="container-page flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between"
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-foreground font-mono text-xs font-semibold text-background"
          >
            {initials}
          </span>
          <p className="text-sm text-muted">
            © {year} {profile.name}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-block py-3 text-sm text-subtle transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex items-center gap-3">
          {socials.map((social) => (
            <li key={social.platform}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.name} on ${social.label}`}
                className="grid size-11 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface hover:text-foreground"
              >
                <BrandIcon platform={social.platform} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </footer>
  );
}