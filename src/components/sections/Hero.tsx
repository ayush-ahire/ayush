import { Chatbot } from "@/components/chatbot/Chatbot";
import { HeroIntro } from "@/components/sections/HeroIntro";
import { LazyHeroBackground } from "@/components/backgrounds/LazyHeroBackground";

/**
 * The hero.
 *
 * Two deliberately distinct columns on desktop — introduction left, AI
 * chatbot right — that stack in that same order on mobile. Keeping the
 * chatbot second in the DOM means it naturally falls below the introduction
 * when the grid collapses, without any breakpoint-specific ordering rules.
 */
export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      <LazyHeroBackground />

      <div className="container-page relative grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <HeroIntro />

        <div className="lg:sticky lg:top-24">
          <Chatbot />
        </div>
      </div>
    </section>
  );
}
