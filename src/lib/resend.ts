import { Resend } from "resend";

import type { ContactPayload } from "@/lib/validation";

/**
 * Contact-form delivery via Resend.
 *
 * The API key is read from the environment inside this module and is never
 * referenced from a client component, so it cannot reach the browser bundle.
 */

/** Thrown for any delivery failure; carries no upstream detail. */
export class ContactDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactDeliveryError";
  }
}

/**
 * Escape text destined for the HTML email body.
 *
 * Visitor-supplied name/subject/message are interpolated into an HTML
 * template, so they must be escaped there or a crafted message could inject
 * markup into an email.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml({ name, email, subject, message }: ContactPayload): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#0a0a0a;color:#ededed;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #262626;border-radius:12px;padding:28px;">
      <h1 style="margin:0 0 4px;font-size:16px;font-weight:600;color:#a1a1aa;">New portfolio enquiry</h1>
      <p style="margin:0 0 24px;font-size:13px;color:#71717a;">${escapeHtml(subject)}</p>

      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#71717a;width:80px;vertical-align:top;">Name</td>
          <td style="padding:8px 0;color:#ededed;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#71717a;vertical-align:top;">Email</td>
          <td style="padding:8px 0;color:#ededed;">${escapeHtml(email)}</td>
        </tr>
      </table>

      <div style="margin-top:20px;padding:16px;background:#0a0a0a;border:1px solid #262626;border-radius:8px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#ededed;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
  </body>
</html>`;
}

function buildText({ name, email, subject, message }: ContactPayload): string {
  return [
    `New portfolio enquiry: ${subject}`,
    "",
    `Name:  ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");
}

/**
 * Deliver one contact submission to the configured inbox.
 *
 * @throws {ContactDeliveryError} when the key is missing or Resend rejects.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;

  if (!apiKey) {
    throw new ContactDeliveryError("RESEND_API_KEY is not configured");
  }

  if (!to) {
    throw new ContactDeliveryError("CONTACT_EMAIL is not configured");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to,
    replyTo: payload.email,
    subject: `Portfolio enquiry from ${payload.name}: ${payload.subject}`,
    html: buildHtml(payload),
    text: buildText(payload),
  });

  if (error) {
    throw new ContactDeliveryError(`Resend rejected the message: ${error.name}`);
  }
}