# Ayush Ahire — Portfolio

A dark-first, single-page portfolio for a Full Stack Developer, built around an
**AI "Ask about me" chatbot** that answers questions from a verified knowledge
base of the portfolio's own content.

The site is statically rendered, ships no client-side secrets, and keeps all
content in plain data files so it can be edited without touching a component.

---

## Overview

**Sections:** Navbar · Hero (+ AI chatbot) · Journey · Projects · Services ·
Contact · Socials · Footer

**Signature feature:** the chatbot in the hero. A visitor asks
*"Who is Ayush?"* or *"Can Ayush build a SaaS application?"* and gets an answer
generated from structured portfolio data — never from free-form guesswork.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Animation | Framer Motion |
| Icons | Lucide React + Simple Icons brand paths |
| AI | OpenRouter (`openrouter/free`) |
| Email | Resend |
| Hosting | Vercel |

No database, no CMS, no auth, no state-management library. The portfolio is
content, not application data — a database would be cost without benefit.

---

## Getting started

```bash
git clone <your-repo-url>
cd ayz-portfolio-website
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open <http://localhost:3000>.

---

## Environment variables

Create `.env.local` (git-ignored) from `.env.example`:

```bash
OPENROUTER_API_KEY=      # https://openrouter.ai/keys
RESEND_API_KEY=          # https://resend.com/api-keys
CONTACT_EMAIL=           # inbox that receives enquiries
NEXT_PUBLIC_SITE_URL=    # https://your-domain.com  (no trailing slash)
```

| Variable | Public? | Used by |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | **No** | `/api/chat` only |
| `RESEND_API_KEY` | **No** | `/api/contact` only |
| `CONTACT_EMAIL` | **No** | `/api/contact` only |
| `NEXT_PUBLIC_SITE_URL` | Yes | metadata, canonical URL, sitemap, robots |

The two API keys are read exclusively inside server route handlers and are
never referenced from a client component, so they cannot reach the browser
bundle. `.env*` is git-ignored with an explicit exception for `.env.example`.

**The chatbot and contact form fail closed.** With no keys set they return the
friendly error message rather than crashing — so the rest of the site still
works during local development.

---

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
npx tsc --noEmit  # type check
```

---

## Editing the content

**All portfolio content lives in `src/data/`. You should never need to edit a
React component to change what the site says.**

| File | Controls |
| --- | --- |
| `src/data/profile.ts` | Name, role, tagline, summary, contact, technologies |
| `src/data/experience.ts` | Journey timeline (education + roles) |
| `src/data/projects.ts` | Project cards and their tags/links |
| `src/data/services.ts` | Services grid |
| `src/data/socials.ts` | Social URLs, footer and Socials section |
| `src/data/site.ts` | Nav links, site metadata, canonical origin |

### Adding a project

```ts
{
  id: "my-project",
  name: "My Project",
  description: "One-line summary.",
  image: "/images/projects/my-project.webp", // or null for a generated tile
  technologies: ["Next.js", "PostgreSQL"],
  links: [{ label: "Live Demo", href: "https://…" }],
  category: "Full Stack",
}
```

Add the file to `public/images/projects/` to have artwork appear. Entries with
`placeholder: true` render as dashed "coming soon" cards and are **excluded**
from the chatbot's knowledge, so a placeholder can never be described to a
visitor as a finished project.

### The chatbot reads the same files

`src/data/profile.ts` imports the other data modules and derives the knowledge
base from them, so `projects.ts` and `experience.ts` are the single source of
truth for both the rendered page **and** the AI's answers. Change a project
once and both update.

---

## How the AI chatbot works

```
Visitor → Chat UI → /api/chat → OpenRouter → free model
                                        ↑
                        verified portfolio knowledge (system prompt)
```

- **`/api/chat`** builds a system prompt from the knowledge base, sends it with
  the conversation to OpenRouter's `openrouter/free` router, and returns only
  the assistant's text.
- **Grounding.** The model may only assert facts present in the
  `<verified_knowledge>` block, and must say it doesn't have a fact rather than
  inventing one. Experience, projects, companies, dates, degrees and
  technologies are never guessed.
- **Prompt-injection resistance.** Visitor messages are explicitly treated as
  untrusted questions, never instructions. The system prompt always occupies
  the first position so a user message cannot displace it, and the knowledge
  base is fenced in tags the model is told to treat as read-only. Asking the
  bot to "ignore all previous instructions" or to invent a credential produces
  a refusal, not a fabricated claim.

  No prompt is a hard security boundary — this is prompt-level hardening, not
  a guarantee. What *is* guaranteed is that the visitor can never extract the
  API key or see internal errors through this path.

- **Swapping the model.** Change `MODEL` in `src/lib/openrouter.ts` to pin a
  specific model id.

---

## Contact form

`/api/contact` validates every field server-side, then forwards to Resend. It
uses a hidden honeypot field plus a minimum-submission-time check to stop naive
spam — no CAPTCHA, no database, no third-party challenge.

Visitor-supplied text is escaped before it goes into the HTML email, and
`replyTo` is set to the sender's address so replying works.

---

## Security

- API keys exist only in server route handlers.
- All input is revalidated on the server; client-side validation is a
  convenience, never a control.
- Request bodies are size-capped before parsing.
- In-memory fixed-window rate limits: **20/min** on chat, **5/10 min** on
  contact. Adequate for a single instance; swap `hit()` in
  `src/lib/rate-limit.ts` for Redis if you scale out.
- Security headers (CSP, `X-Frame-Options`, `nosniff`, HSTS, Referrer-Policy,
  Permissions-Policy) are set in `next.config.ts`.
- Upstream failures are logged server-side and replaced with generic messages —
  no stack traces, provider errors or secrets reach the visitor.

---

## Performance & SEO

- The page is statically prerendered; only the hero intro, chatbot, timeline
  and form hydrate.
- The chatbot renders a static shell rather than being deferred with
  `ssr: false`, so it appears immediately and never blocks LCP.
- Fonts self-hosted through `next/font` (zero requests to Google), swapped in
  to avoid invisible text.
- All content renders on the server — nothing important is client-only.
- Full metadata: canonical URL, Open Graph, Twitter card, `robots.ts`,
  `sitemap.ts`, semantic landmarks, and `Person` JSON-LD built from the same
  data files.

---

## Accessibility

Semantic landmarks and a skip link; visible focus rings on every interactive
element; `aria-live` regions for chat replies, form status and errors; labelled
form fields with per-field validation messages; Escape closes the mobile menu;
body scroll locked while it's open.

**Reduced motion is respected twice over** — Framer Motion animations are
skipped in code via `useReducedMotion`, and a CSS media query disables
transitions as a backstop. The site is fully usable with motion disabled.

---

## Deploying to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the four environment variables under **Settings → Environment Variables**.
3. Deploy. No build overrides needed — Next.js is detected automatically.

The rate limiter is per-instance, so serverless functions may each hold their
own counter. That is acceptable abuse protection for a portfolio; move to Redis
if you later need a strict global limit.

---

## Project structure

```text
src/
├── app/
│   ├── api/chat/route.ts      # OpenRouter proxy (key stays server-side)
│   ├── api/contact/route.ts   # Resend delivery (key stays server-side)
│   ├── layout.tsx             # fonts, metadata, navbar, footer
│   ├── page.tsx               # single page + JSON-LD
│   ├── robots.ts  sitemap.ts
│   └── globals.css            # design tokens, dark theme
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── sections/              # Hero, HeroIntro, Journey, Projects, …
│   ├── chatbot/               # Chatbot, ChatMessage, ChatInput, …
│   ├── projects/  services/   # ProjectCard, ServiceCard
│   ├── icons/                 # BrandIcon (Simple Icons paths)
│   └── ui/                    # Button, Section, motion primitives
├── data/                      # ← all content lives here
├── lib/                       # openrouter, resend, validation, rate-limit
└── types/
```

UI, data, server logic and types are kept in separate layers; nothing in
`components/` hardcodes content that belongs in `data/`.

---

## Roadmap-friendly

The structure leaves room for a blog, testimonials, analytics, more projects,
a CMS or an admin dashboard without a rewrite: content is data-driven and the
section components are independent and reusable.