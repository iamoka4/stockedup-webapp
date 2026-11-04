type PixelParams = Record<string, unknown>;
type Fbq = (...args: unknown[]) => void;

/**
 * Safe wrapper around fbq("track", ...). The pixel script loads after the page
 * hydrates (next/script afterInteractive), so if a user lands straight on a
 * product page, fbq may not exist yet. Retry briefly instead of dropping the event.
 */
export function fbqTrack(event: string, params?: PixelParams, eventId?: string) {
  if (typeof window === "undefined") return;

  let attempts = 0;

  const send = () => {
    try {
      const fbq = (window as unknown as { fbq?: Fbq }).fbq;
      if (!fbq) {
        if (attempts++ < 20) setTimeout(send, 500);
        return;
      }
      if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
      else if (params) fbq("track", event, params);
      else fbq("track", event);
    } catch {
      // Tracking must never break the shop.
    }
  };

  send();
}