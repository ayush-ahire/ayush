"use client";

import { useRef, type FormEvent } from "react";
import { SendHorizonal } from "lucide-react";

import { MAX_MESSAGE_LENGTH } from "@/lib/validation";

/**
 * The composer.
 *
 * Enter submits and Shift+Enter inserts a newline, the convention visitors
 * expect from a chat interface. The character counter appears only once the
 * field is close to the limit, so it stays out of the way in normal use.
 */
export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Disabled while a reply is in flight. */
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow the field with its content, up to the CSS max-height.
  const handleChange = (next: string) => {
    onChange(next);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!value.trim() || disabled) return;
      onSubmit();
    }
  };

  const remaining = MAX_MESSAGE_LENGTH - value.length;
  const showCounter = remaining <= 100;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-border p-3"
    >
      <label htmlFor="chat-input" className="sr-only">
        Ask a question about Ayush
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        disabled={disabled}
        placeholder="Ask about experience, projects, skills…"
        aria-describedby={showCounter ? "chat-counter" : undefined}
        className="max-h-30 min-h-11 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-border-strong focus:outline-none disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="grid size-11 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-all hover:bg-accent-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      >
        <SendHorizonal className="size-4" aria-hidden="true" />
      </button>

      {showCounter ? (
        <p
          id="chat-counter"
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          {remaining} characters remaining
        </p>
      ) : null}
    </form>
  );
}