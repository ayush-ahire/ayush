import { NextResponse } from "next/server";

import { buildSystemPrompt } from "@/lib/knowledge";
import { completeChat, OpenRouterError, type ChatTurn } from "@/lib/openrouter";
import { clientIdentifier, hit, retryAfterSeconds } from "@/lib/rate-limit";
import { validateChat } from "@/lib/validation";

/**
 * AI chatbot endpoint.
 *
 * The browser never sees an OpenRouter key: this handler reads
 * `OPENROUTER_API_KEY` from the server environment, prepends a system prompt
 * built from the verified portfolio data, and returns only the assistant's
 * text. Upstream error detail is logged, never returned.
 */

/** Allows bursts of conversation but caps sustained abuse of a free tier. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

/** User-facing message for any failure, per the error-handling spec. */
const GENERIC_ERROR =
  "Sorry, I'm having trouble answering right now. Please try again.";

export async function POST(request: Request) {
  // Rate limit first, before parsing a body, so a flood costs as little as
  // possible.
  const limit = hit(`chat:${clientIdentifier(request)}`, RATE_LIMIT, RATE_WINDOW_MS);

  if (!limit.success) {
    return NextResponse.json(
      { error: GENERIC_ERROR },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(limit.resetAt)) },
      },
    );
  }

  // A body larger than this is not a plausible chat message; reject before
  // spending time on JSON parsing.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 8_192) {
    return NextResponse.json(
      { error: "Request too large." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const validated = validateChat(body);
  if (!validated.ok) {
    return NextResponse.json(validated.errors, { status: 400 });
  }

  const { message, history } = validated.data;

  // The system prompt always leads, so a visitor's message can never take the
  // first position and displace the knowledge-base rules.
  const turns: ChatTurn[] = [
    { role: "system", content: buildSystemPrompt() },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: message },
  ];

  try {
    const reply = await completeChat(turns, request.signal);

    return NextResponse.json(
      { reply },
      {
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof OpenRouterError) {
      // Log the detail for the operator; return a generic message to the
      // visitor so nothing about the upstream service leaks out.
      console.error("OpenRouter request failed:", error.message, {
        status: error.status,
      });
      return NextResponse.json(
        {
          error: GENERIC_ERROR,
          ...(process.env.NODE_ENV !== "production" ? { detail: error.message } : {}),
        },
        { status: 502 },
      );
    } else {
      console.error("Unexpected chat error:", error);
    }

    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}