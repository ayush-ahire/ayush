"use client";

import { Loader2 } from "lucide-react";

import type { ChatMessage as Message } from "@/components/chatbot/types";
import { cn } from "@/lib/utils";

/**
 * One bubble in the transcript.
 *
 * Assistant messages are left-aligned on a raised surface; visitor messages
 * are right-aligned and inverted. The speaker is conveyed by an `sr-only`
 * prefix rather than colour alone, so the distinction survives a
 * high-contrast or monochrome rendering.
 */
export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-foreground text-background"
            : "rounded-bl-md border border-border bg-surface-raised text-foreground",
        )}
      >
        <span className="sr-only">
          {isUser ? "You said: " : "Assistant said: "}
        </span>

        {message.pending ? (
          <span
            className="flex items-center gap-2 text-muted"
            role="status"
            aria-label="Assistant is typing"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">Thinking…</span>
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}