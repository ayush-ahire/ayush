/**
 * Shared types for the chatbot UI.
 *
 * The message union includes an explicit loading state rather than a separate
 * `isLoading` boolean, so a pending turn is a real entry in the transcript —
 * which keeps rendering, history and accessibility in sync.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** True while the assistant reply is still in flight. */
  pending?: boolean;
}

/** The assistant's opening line, shown before the visitor types anything. */
export const GREETING =
  "Hi — I'm Ayush's AI assistant. Ask me about his experience, projects, skills or services.";