/**
 * Minimal OpenRouter client.
 *
 * Uses `fetch` against the REST API rather than the OpenRouter SDK: the chat
 * endpoint is a single POST, and a hand-rolled client keeps the dependency
 * list short and makes the request shape explicit.
 */

/**
 * OpenRouter's `:free` router, which picks a no-cost upstream model. Swapping
 * to a pinned model id (e.g. `google/gemini-2.0-flash-exp:free`) is a one-line
 * change here.
 */
const MODEL = "openrouter/free";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Sent as `HTTP-Referer` / `X-Title` to identify the app in OpenRouter's dashboard. Must be ASCII. */
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const APP_TITLE = "Ayush Ahire - Portfolio";

/** Model-level guard so a slow free tier fails fast instead of holding the request open. */
const TIMEOUT_MS = 20_000;

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Thrown for any upstream failure. Carries no detail from OpenRouter's
 * response body, so nothing internal can leak into a user-facing message.
 */
export class OpenRouterError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Send a conversation to OpenRouter and return the assistant's reply.
 *
 * @throws {OpenRouterError} on any network, timeout, or non-2xx response.
 */
export async function completeChat(
  turns: ChatTurn[],
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not configured");
  }

  // Compose the caller's signal with our own timeout so either can abort it.
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL.replace(/[^\x00-\x7F]/g, ""),
        "X-Title": APP_TITLE.replace(/[^\x00-\x7F]/g, ""),
      },
      body: JSON.stringify({
        model: MODEL,
        messages: turns,
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: combined,
    });
  } catch (err) {
    console.error("[OpenRouter] Fetch threw an exception:", err);
    // Distinguish our timeout from a genuine network failure for logging only.
    const timedOut = timeout.aborted;
    throw new OpenRouterError(
      timedOut ? "OpenRouter request timed out" : `OpenRouter fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      undefined,
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(`[OpenRouter] HTTP Error ${response.status}:`, errorText);
    throw new OpenRouterError(
      `OpenRouter responded with ${response.status}: ${errorText.slice(0, 200)}`,
      response.status,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const reply = payload.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new OpenRouterError("OpenRouter returned an empty completion");
  }

  return reply;
}