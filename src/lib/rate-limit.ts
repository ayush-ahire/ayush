/**
 * In-memory fixed-window rate limiter.
 *
 * Adequate for a single-instance portfolio deployment: it needs no database
 * and no extra dependency. On a multi-instance or serverless deployment each
 * instance keeps its own counters, which makes the effective limit higher
 * than configured — acceptable abuse protection, not a security boundary.
 * Swap the `hit` implementation for Redis if a shared limit is ever needed.
 */

export interface RateLimitResult {
  success: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** Unix ms at which the current window resets. */
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evict expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Count one request against `key`.
 *
 * @param limit Maximum requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  return {
    success: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Seconds until `resetAt`, never less than 1 — for the Retry-After header. */
export function retryAfterSeconds(resetAt: number): number {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

/**
 * Best-effort client identifier for rate limiting.
 *
 * Trusts `x-forwarded-for` (set by Vercel and other proxies) because the app
 * runs behind a proxy in production, and there is no other way to distinguish
 * visitors without an auth layer. Falls back to a constant so an unparseable
 * header degrades to a shared bucket rather than throwing.
 */
export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || "anonymous";
}