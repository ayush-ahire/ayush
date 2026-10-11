/**
 * Shared server-side validation.
 *
 * Hand-rolled rather than pulling in Zod: the rules are simple enough that a
 * dependency would cost more than it saves. Everything here runs *after* the
 * client-side check — the client is a convenience, never a guarantee.
 */

/** Hard ceiling on any accepted text field, to bound request size. */
export const MAX_FIELD_LENGTH = 2_000;

/** Longest permitted chat message, in characters. */
export const MAX_MESSAGE_LENGTH = 500;

export interface FieldErrors {
  [field: string]: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

/**
 * Coerce an unknown value to a trimmed string.
 *
 * Returns null for non-strings so callers must handle the invalid case rather
 * than accidentally stringifying objects or arrays into user-visible output.
 */
function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

/**
 * Strip control characters (except newline/tab) and collapse runs of blank
 * lines. React escapes on render, so this is defence in depth for email and
 * log output rather than XSS defence.
 */
export function sanitiseText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Email validation.
 *
 * Intentionally pragmatic: one `@`, a dot in the domain, no whitespace. The
 * only real test of an address is sending to it.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /**
   * Timestamp from a hidden field. Bots that submit the form immediately
   * leave it ~0; humans take at least a second or two. A honeypot plus this
   * timing check is enough to stop naive spam without a CAPTCHA.
   */
  startedAt: number;
}

/** Message length is capped well below `MAX_FIELD_LENGTH`. */
const MAX_MESSAGE_FIELD = 5_000;

export function validateContact(body: unknown): ValidationResult<ContactPayload> {
  const errors: FieldErrors = {};

  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: { form: "Invalid request." } };
  }

  const record = body as Record<string, unknown>;

  const name = asString(record.name);
  const email = asString(record.email);
  const subject = asString(record.subject);
  const message = asString(record.message);
  const startedAt = typeof record.startedAt === "number" ? record.startedAt : 0;

  // Honeypot: a real user never sees this field, so anything in it is a bot.
  const honeypot = asString(record.website);
  if (honeypot) {
    return { ok: false, errors: { form: "Invalid request." } };
  }

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length > 100) {
    errors.name = "Name must be under 100 characters.";
  }

  if (!email) {
    errors.email = "Please enter your email.";
  } else if (email.length > 254 || !isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!subject) {
    errors.subject = "Please enter a subject.";
  } else if (subject.length > 150) {
    errors.subject = "Subject must be under 150 characters.";
  }

  if (!message) {
    errors.message = "Please enter a message.";
  } else if (message.length > MAX_MESSAGE_FIELD) {
    errors.message = `Message must be under ${MAX_MESSAGE_FIELD} characters.`;
  }

  // Timing check: reject submissions completed implausibly fast.
  if (startedAt > 0 && Date.now() - startedAt < 1_000) {
    errors.form = "Please wait a moment and try again.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: sanitiseText(name!),
      email: email!.toLowerCase(),
      subject: sanitiseText(subject!),
      message: sanitiseText(message!),
      startedAt,
    },
  };
}

export interface ChatPayload {
  message: string;
  /** Prior turns, oldest first, so the model keeps conversational context. */
  history: { role: "user" | "assistant"; content: string }[];
}

export function validateChat(body: unknown): ValidationResult<ChatPayload> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: { message: "Invalid request." } };
  }

  const record = body as Record<string, unknown>;
  const errors: FieldErrors = {};

  const message = asString(record.message);
  if (!message) {
    errors.message = "Please enter a message.";
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be under ${MAX_MESSAGE_LENGTH} characters.`;
  }

  // Rebuild history from scratch rather than trusting its shape: only plain
  // user/assistant turns with sane content survive.
  const rawHistory = Array.isArray(record.history) ? record.history : [];
  const history: ChatPayload["history"] = [];

  for (const turn of rawHistory.slice(-8)) {
    if (typeof turn !== "object" || turn === null) continue;
    const candidate = turn as Record<string, unknown>;
    const role = candidate.role;
    const content = asString(candidate.content);
    if (content && (role === "user" || role === "assistant")) {
      history.push({ role, content: sanitiseText(content).slice(0, MAX_MESSAGE_LENGTH) });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { message: sanitiseText(message!), history },
  };
}