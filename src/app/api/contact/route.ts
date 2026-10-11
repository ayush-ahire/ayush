import { NextResponse } from "next/server";

import { clientIdentifier, hit, retryAfterSeconds } from "@/lib/rate-limit";
import { ContactDeliveryError, sendContactEmail } from "@/lib/resend";
import { validateContact } from "@/lib/validation";

/**
 * Contact form endpoint.
 *
 * Validates on the server, then hands the message to Resend. The API key is
 * read here and never serialised to the client. Submissions are not stored —
 * Resend's delivery is the record.
 */

/** Deliberately stricter than chat: a handful of emails per minute is plenty. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60_000;

const GENERIC_ERROR =
  "Something went wrong while sending your message. Please try again.";

export async function POST(request: Request) {
  const limit = hit(
    `contact:${clientIdentifier(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(limit.resetAt)) },
      },
    );
  }

  // Bound request size before parsing — the form's own limits are far lower.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 16_384) {
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

  const validated = validateContact(body);
  if (!validated.ok) {
    return NextResponse.json({ errors: validated.errors }, { status: 400 });
  }

  try {
    await sendContactEmail(validated.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ContactDeliveryError) {
      console.error("Contact email delivery failed:", error.message);
    } else {
      console.error("Unexpected contact error:", error);
    }

    // Deliberately not 500-with-detail: a generic message and a log entry.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}