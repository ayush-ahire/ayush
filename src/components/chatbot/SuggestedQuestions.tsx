"use client";

import { suggestedQuestions } from "@/lib/knowledge";

import { cn } from "@/lib/utils";

/**
 * One-tap question chips shown before and after the conversation starts.
 *
 * Rendered as real buttons so they're reachable by keyboard and announced as
 * actionable, rather than click-only divs.
 */
export function SuggestedQuestions({
  onSelect,
  disabled,
  className,
}: {
  onSelect: (question: string) => void;
  /** Disabled while a reply is in flight, to avoid concurrent requests. */
  disabled?: boolean;
  className?: string;
}) {
  // Cast away the `as const` tuple to a plain string[] for mapping.
  const questions: readonly string[] = suggestedQuestions;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {questions.map((question) => (
        <li key={question}>
          <button
            type="button"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="rounded-full border border-border bg-surface px-3.5 py-2.5 text-left text-xs text-muted transition-colors hover:border-border-strong hover:bg-surface-raised hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
}