// src/lib/analytics.ts
// One place for web analytics events. It forwards to Google Analytics (gtag)
// if the site has it installed, and does nothing otherwise, so calling it is
// always safe. To use another provider (PostHog, Firebase...), change only
// the body of trackEvent.

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // analytics must never break the page
  }
}