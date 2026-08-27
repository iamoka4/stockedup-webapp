/**
 * Central config. Every value that points at the PHP backend lives here so
 * there's exactly one place to change when the API domain or a route name
 * changes.
 *
 * NEXT_PUBLIC_API_BASE_URL should be a relative path (e.g. "/backend/api")
 * so browser requests go through the Next.js rewrite in next.config.ts and
 * avoid CORS. Server-side requests (Server Components, route handlers)
 * can't resolve relative URLs — Node's fetch() has no "current page" to
 * resolve against — so on the server we build an absolute URL instead,
 * pointing directly at the real backend.
 */
function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend/api";

  // Already absolute (e.g. someone set the env var to a full URL) — use as-is.
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured;
  }

  // Browser: relative path is fine, goes through the rewrite.
  if (typeof window !== "undefined") {
    return configured;
  }

  // Server: need an absolute URL. Point directly at the real backend,
  // bypassing the rewrite (which only exists for browser requests anyway).
  return `https://api.stockedup.africa/backend/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const SITE_NAME = "StockedUp Africa";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stockedup.africa";
export const DEFAULT_CITY = "Awka";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";