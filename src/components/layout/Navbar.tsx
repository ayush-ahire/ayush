"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DURATION, EASE, fadeUp, staggerContainer } from "@/components/ui/motion";
import { CTA_LABEL, NAV_LINKS } from "@/data/site";
import { profile } from "@/data/profile";
import { createLabelDecoder } from "@/lib/label-decoder";
import { cn } from "@/lib/utils";

/**
 * Sticky site navigation.
 *
 * Transparent over the hero, then gains a blurred background once the page
 * scrolls so the links stay legible over content passing beneath. The mobile
 * menu is a dialog rather than a dropdown: it carries `role="dialog"` with
 * `aria-modal`, traps Tab while open, and returns focus to the toggle on close,
 * so keyboard and screen-reader users aren't stranded behind the page.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  /*
   * Kept so focus can return to the toggle once the menu closes. Without this,
   * dismissing the menu with Escape drops focus back to <body> and a keyboard
   * user has to tab the entire page again to get where they were.
   */
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* The mobile menu panel, so focus can be kept inside it while it is open. */
  const panelRef = useRef<HTMLDivElement>(null);

  /* The static desktop link list, the only labels the decoder is mounted on. */
  const linksRef = useRef<HTMLUListElement>(null);

  // Only the header's own appearance depends on scroll position.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page behind the mobile menu from scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Escape closes the menu, matching the convention for dialogs.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /*
   * Attach the hover label-decoding to the static links in the bar.
   *
   * Deliberately scoped to `navRef`, which excludes the MENU/CLOSE toggle and
   * the mobile panel:
   *
   * - The panel's links only exist once the menu is open, so they are wired by
   *   their own effect below rather than measured here.
   * - The toggle's label changes between "MENU" and "CLOSE", which are
   *   different widths. A decoder pinning one width to it would lock the label
   *   at the other one's measure and either clip it or leave the pill gaping.
   *   It keeps its plain static label instead.
   */
  useEffect(() => createLabelDecoder(linksRef.current), []);

  /*
   * Keep Tab inside the open menu.
   *
   * Locking `body` scroll stops the page moving but does nothing about focus,
   * so without this a keyboard user tabs straight out of the panel and into
   * content sitting behind it — focus that is invisible but still announced.
   * Wrapping is only meaningful once something inside is focused, so the panel
   * itself takes focus on open and Escape hands it back to the toggle.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at whichever end focus is leaving from.
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    // Land on the first link rather than leaving focus up in the header, which
    // would make the next Tab a wrap-around.
    focusable()[0]?.focus();

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /*
   * The panel's links are wired separately, once the panel is open.
   *
   * They can't share the bar's decoder: the panel is unmounted until the menu
   * opens, so measuring it any earlier would reserve widths from a subtree
   * with no layout and pin every link to zero.
   */
  useEffect(() => {
    if (!menuOpen) return;
    return createLabelDecoder(panelRef.current);
  }, [menuOpen]);

  // Return focus to the toggle after the exit animation finishes, so it lands
  // on a visible element rather than mid-unmount.
  const handleExitComplete = () => {
    if (!menuOpen) toggleRef.current?.focus();
  };

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-black/[0.04] bg-white/70 backdrop-blur-md dark:border-transparent dark:bg-transparent dark:backdrop-blur-none",
      )}
    >
      <nav
        aria-label="Main"
        className="container-page flex h-16 items-center justify-between gap-6"
      >
        <a
          href="#home"
          className="flex items-center gap-2.5 text-sm font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-foreground font-mono text-xs font-semibold text-background"
          >
            {initials}
          </span>
          <span className="hidden font-semibold text-neutral-900 sm:inline dark:font-medium dark:text-foreground">
            {profile.name}
          </span>
        </a>

        {/* Desktop navigation */}
        <ul ref={linksRef} className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="lbl"
              >
                <span className="t">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* ThemeToggle remains for functionality */}
          <ThemeToggle />

          {/* MENU pill - Stratum style (mobile menu button) */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="menu lbl"
          >
            <svg className="ico" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="0" y="0" width="4" height="4" rx=".8"/><rect x="6" y="0" width="4" height="4" rx=".8"/><rect x="0" y="6" width="4" height="4" rx=".8"/><rect x="6" y="6" width="4" height="4" rx=".8"/></svg>
            <span className="t">{menuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence onExitComplete={handleExitComplete}>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            {/*
              The outer div has to keep `overflow-hidden` for the height
              animation, which would also stop this list scrolling on a short
              viewport — a landscape phone, or a small window — while the body
              behind it is locked. So the cap and the scrolling live on an inner
              wrapper, and the "Let's Work Together" CTA stays reachable.
            */}
            <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">

            {/*
              The panel and its items animate together: the container staggers,
              the children inherit. Items slide in from the left so the list
              reads as arriving rather than simply appearing.
            */}
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="container-page flex flex-col gap-1 py-6"
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={fadeUp}
                  transition={{ duration: DURATION.normal, ease: EASE }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="lbl"
                  >
                    <span className="t">{link.label}</span>
                  </a>
                </motion.li>
              ))}
              <motion.li
                variants={fadeUp}
                transition={{ duration: DURATION.normal, ease: EASE }}
                className="pt-3"
              >
                <ButtonLink
                  href="#contact"
                  size="lg"
                  onClick={() => setMenuOpen(false)}
                  className="w-full"
                >
                  {CTA_LABEL}
                </ButtonLink>
              </motion.li>
            </motion.ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}