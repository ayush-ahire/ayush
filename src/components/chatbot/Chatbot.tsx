"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { SuggestedQuestions } from "@/components/chatbot/SuggestedQuestions";
import { GREETING, type ChatMessage as Message } from "@/components/chatbot/types";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation";

/** Shown when the request fails, per the error-handling spec. */
const GENERIC_ERROR =
  "Sorry, I'm having trouble answering right now. Please try again.";

/**
 * The "Ask AI about me" panel.
 *
 * All conversation state lives here; the API key is never involved — the
 * browser talks only to `/api/chat`, and that route holds the OpenRouter call.
 *
 * Two accessibility details worth noting: the transcript is a live region so
 * replies are announced without stealing focus, and focus never moves into
 * the message list, so a screen-reader user can keep typing while a reply
 * lands.
 */
export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Ref to the last sent message, so the next send starts history cleanly. */
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const inFlightRef = useRef(false);

  // Follow new messages, but only once the user is already near the bottom —
  // otherwise scrolling back through history gets yanked to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
  }, [messages]);

  const send = useCallback(async (raw: string) => {
    const question = raw.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!question || inFlightRef.current) return;

    // The ref, not `busy`, guards against a second request: `busy` is still
    // false within the same tick when a chip is double-clicked.
    inFlightRef.current = true;
    setBusy(true);

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
    };
    const pendingMessage: Message = {
      id: `p-${Date.now()}`,
      role: "assistant",
      content: "",
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: historyRef.current }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();

      if (!reply) {
        throw new Error("Chat response contained no reply");
      }

      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: question },
        { role: "assistant", content: reply },
      ];

      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: reply, pending: false }
            : message,
        ),
      );
    } catch (error) {
      console.error("Chat request failed", error);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: GENERIC_ERROR, pending: false }
            : message,
        ),
      );
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    void send(input);
  }, [input, send]);

  const handleSelectQuestion = useCallback(
    (question: string) => {
      void send(question);
    },
    [send],
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="flex h-full min-h-112 flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface"
    >
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-foreground text-background"
        >
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Ask AI about me</h2>
          <p className="truncate text-xs text-subtle">Ask anything about Ayush.</p>
        </div>
      </header>

      {/* Transcript. Labelled and polite so replies are announced without
          interrupting whatever the visitor is currently doing. */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 space-y-3 overflow-y-auto p-5"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {messages.length <= 1 ? (
          <SuggestedQuestions
            onSelect={handleSelectQuestion}
            disabled={busy}
            className="pt-2"
          />
        ) : null}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={busy}
      />
    </motion.div>
  );
}