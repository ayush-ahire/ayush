import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A page section with the shared vertical rhythm and scroll anchor.
 *
 * `id` is what navbar links and in-page CTAs target. Pass `headingId` when the
 * section contains a `<SectionHeading>` — it links the landmark to its heading
 * so screen reader users can jump straight to the section name.
 *
 * No per-section `scroll-mt` here on purpose: `globals.css` sets
 * `scroll-padding-top` on `html`, and the two compound — a scroll-padding
 * inset and a scroll-margin on the target add up, which would land anchored
 * headings well below the sticky navbar.
 */
export function Section({
  id,
  headingId,
  children,
  className,
  as: Tag = "section",
  ...rest
}: {
  id: string;
  headingId?: string;
  children: ReactNode;
  className?: string;
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"section">, "id" | "children" | "className">) {
  return (
    <Tag
      id={id}
      aria-labelledby={headingId}
      className={cn("py-24 sm:py-32", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}