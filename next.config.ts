import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * The CSP is deliberately strict but must still permit what the app genuinely
 * needs: React's runtime inlines a bootstrap script, so `script-src` needs
 * `'unsafe-inline'` unless nonce-based rendering is introduced. `'strict-dynamic'`
 * is not used — it would defeat the purpose without nonces. The external
 * connection allowance is OpenRouter, called server-side, so it is listed
 * under `connect-src` for completeness but is never reachable from the browser.
 *
 * `'unsafe-eval'` is added in development only. React uses `eval` in dev to
 * reconstruct server-side error stacks in the browser; neither React nor Next.js
 * use `eval` in production, so the production policy stays strict.
 *
 * `X-Frame-Options` is kept alongside the CSP `frame-ancestors` because the
 * header is still honoured by older browsers.
 */
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://openrouter.ai",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;