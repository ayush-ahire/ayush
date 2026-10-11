"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { isValidEmail } from "@/lib/validation";

/**
 * Client-side validation, run before submitting.
 *
 * This mirrors the server rules purely to give fast feedback — the server
 * revalidates everything regardless, so nothing here is a security control.
 */
function validate(values: FormValues): Partial<Record<keyof FormValues, string>> {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (values.name.trim().length > 100) {
    errors.name = "Name must be under 100 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Please enter a subject.";
  } else if (values.subject.trim().length > 150) {
    errors.subject = "Subject must be under 150 characters.";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message.";
  }

  return errors;
}

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormValues = { name: "", email: "", subject: "", message: "" };

const GENERIC_ERROR =
  "Something went wrong while sending your message. Please try again.";

/**
 * The contact form.
 *
 * Submitting posts to `/api/contact`, which forwards to Resend server-side —
 * the Resend key never reaches the browser. Three states are represented
 * explicitly: idle, submitting, and a terminal success or error.
 *
 * Errors are surfaced in a live region so a screen-reader user hears the
 * failure without having to go hunting for it.
 */
export function ContactForm() {
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [formError, setFormError] = useState("");

  // Records when the form was first rendered, so the server can reject
  // submissions completed implausibly fast (a simple bot check).
  const [startedAt] = useState(() => Date.now());

  const update = (field: keyof FormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error as soon as the visitor starts fixing the field.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "submitting") return;

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Move focus to the first invalid field so keyboard users aren't left
      // wondering why nothing happened.
      const firstInvalid = Object.keys(found)[0];
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        errors?: Record<string, string>;
        error?: string;
      };

      if (!response.ok) {
        // Surface per-field messages when the server flagged specific fields,
        // otherwise fall back to the single generic error.
        if (data.errors && Object.keys(data.errors).length > 0) {
          setErrors(data.errors);
        }
        setFormError(data.error || GENERIC_ERROR);
        setStatus("error");
        return;
      }

      setValues(EMPTY);
      setStatus("success");
    } catch (error) {
      console.error("Contact form submission failed", error);
      setFormError(GENERIC_ERROR);
      setStatus("error");
    }
  };

  const fieldClass = (field: keyof FormValues) =>
    [
      "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-subtle focus:outline-none transition-colors",
      errors[field]
        ? "border-error focus:border-error"
        : "border-border focus:border-border-strong",
      status === "submitting" && "opacity-60",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="text-sm text-muted">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={update("name")}
            disabled={status === "submitting"}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={fieldClass("name")}
          />
          {errors.name ? (
            <p id="contact-name-error" className="text-xs text-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="text-sm text-muted">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={update("email")}
            disabled={status === "submitting"}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={fieldClass("email")}
          />
          {errors.email ? (
            <p id="contact-email-error" className="text-xs text-error">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-subject" className="text-sm text-muted">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={values.subject}
          onChange={update("subject")}
          disabled={status === "submitting"}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={fieldClass("subject")}
        />
        {errors.subject ? (
          <p id="contact-subject-error" className="text-xs text-error">
            {errors.subject}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm text-muted">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={update("message")}
          disabled={status === "submitting"}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${fieldClass("message")} resize-y`}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-xs text-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/*
        Honeypot. Hidden from humans by CSS *and* from assistive tech by
        aria-hidden + tabindex, so a screen reader never announces a blank
        field that exists only to catch bots.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </Button>

        {/* Status announcements for assistive tech. */}
        <div role="status" aria-live="polite" className="sr-only">
          {status === "submitting" ? "Sending your message." : ""}
          {status === "success" ? "Your message has been sent." : ""}
          {status === "error" ? formError : ""}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.p
              key="success"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
            >
              <Check className="size-4 shrink-0" aria-hidden="true" />
              Thanks — your message has been sent. I&apos;ll get back to you soon.
            </motion.p>
          ) : status === "error" ? (
            <motion.p
              key="error"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}