import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

/**
 * The heading block that opens every section.
 *
 * Keeping the eyebrow / title / description triad in one component is what
 * makes the vertical rhythm read as deliberate rather than per-section.
 *
 * `id` should match the parent `<Section headingId>` so the region landmark
 * is announced with its heading.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  id?: string;
  /** Short uppercase label above the title, e.g. "Selected work". */
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "text-3xl font-semibold tracking-tight text-balance sm:text-4xl",
          align === "center" && "max-w-2xl",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed text-muted text-pretty",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}