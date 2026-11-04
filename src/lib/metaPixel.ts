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

// ── Purchase tracking ───────────────────────────────────────────────────────
// Checkout saves what the customer is about to pay; the success page reads it,
// fires Purchase once, then clears it.

const PENDING_KEY = "stk_pending_purchase";
const TRACKED_PREFIX = "stk_purchase_tracked_";
const PENDING_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface PendingPurchase {
  value: number;
  content_ids: string[];
  num_items: number;
}

export function savePendingPurchase(purchase: PendingPurchase) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...purchase, ts: Date.now() }));
  } catch {
    // Storage unavailable — Purchase just won't be tracked.
  }
}

function readPendingPurchase(): PendingPurchase | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase & { ts?: number };
    if (!parsed.ts || Date.now() - parsed.ts > PENDING_MAX_AGE_MS) return null;
    if (!Number.isFinite(parsed.value) || parsed.value <= 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Fires the Meta Pixel Purchase event at most once per order, even if the
 * customer refreshes the success page. The event ID lets Meta de-duplicate
 * if you later add the Conversions API.
 */
export function trackPurchaseOnce(orderId: string) {
  if (typeof window === "undefined" || !orderId) return;

  try {
    const flagKey = TRACKED_PREFIX + orderId;
    if (localStorage.getItem(flagKey)) return;

    const pending = readPendingPurchase();
    if (!pending) return; // No trustworthy value — skip rather than send a wrong one.

    localStorage.setItem(flagKey, "1");
    sessionStorage.removeItem(PENDING_KEY);

    fbqTrack(
      "Purchase",
      {
        value: pending.value,
        currency: "NGN",
        content_type: "product",
        content_ids: pending.content_ids,
        num_items: pending.num_items,
      },
      `purchase_${orderId}`
    );
  } catch {
    // Tracking must never break the shop.
  }
}