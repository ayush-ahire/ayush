import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared button and link-button styling.
 *
 * `variant` sets the visual treatment, `size` the scale. Both the `<button>`
 * and `<a>` forms render the same classes so a CTA never changes appearance
 * depending on whether it navigates or submits.
 *
 * `whitespace-nowrap` is deliberate — a button label reads better on one line —
 * so it is paired with `max-w-full` and `min-w-0`. Without those, a label too
 * long for a 320px viewport (a longer CTA string, a translated locale, a user
 * minimum font size above 16px) cannot wrap and cannot shrink, and would push
 * the whole page sideways instead of ellipsising inside its own box.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex max-w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-accent-muted active:scale-[0.98]",
  secondary:
    "border border-border-strong bg-surface text-foreground hover:bg-surface-raised hover:border-subtle active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-surface",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/** A real `<button>` — for form submits and other in-page actions. */
export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/**
 * A link styled as a button.
 *
 * Used for anchor targets within the page, so it deliberately renders a plain
 * `<a>` rather than a client-side route transition — smooth scrolling is
 * handled by CSS.
 */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}