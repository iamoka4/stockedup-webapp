"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "lucide-react";
import { getOrderTracking, type Order } from "@/lib/api/orders";

const POLL_MS = 10_000;

/**
 * `delivery_pin` is optional: it is only present on the order payload when
 * the API includes it, and the tracking poll below is the main source anyway.
 * Declared here so this component compiles regardless of how `Order` is
 * defined in lib/api/orders.
 */
type LiveOrder = Order & { delivery_pin?: string | null };

/**
 * Delivery PIN banner + "Track order" button, shown on active orders
 * (Accepted / Enroute). Polls get-order-tracking.php, like the mobile app,
 * and pauses while the browser tab is hidden.
 */
export function OrderLiveInfo({ order }: { order: LiveOrder }) {
  const eligible = order.status === "Accepted" || order.status === "Enroute";
  const [pin, setPin] = useState<string | null | undefined>(undefined);
  const [deliveryStatus, setDeliveryStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!eligible) return;
    let cancelled = false;

    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const t = await getOrderTracking(order.order_id);
        if (cancelled) return;
        setPin(t.delivery_pin ? String(t.delivery_pin) : null);
        if (t.delivery_status) setDeliveryStatus(String(t.delivery_status));
      } catch {
        /* silent: retry on the next tick */
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [eligible, order.order_id]);

  if (!eligible) return null;

  const shownPin = pin !== undefined ? pin : order.delivery_pin ?? null;
  const showTrack = deliveryStatus === "rider_assigned";
  if (!shownPin && !showTrack) return null;

  // The whole card is a link to the order detail page, so clicks and keys
  // in here must not bubble up to it.
  return (
    <div
      className="mt-4 flex flex-col gap-3"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {shownPin && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-tint p-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand-deep">Delivery PIN</p>
            <p className="mt-0.5 text-[11px] text-ink-soft">
              Share this PIN with your rider only when your order arrives
            </p>
          </div>
          <span className="tabular font-display text-2xl font-bold tracking-[0.3em] text-brand-deep">
            {shownPin}
          </span>
        </div>
      )}

      {showTrack && (
        <Link
          href={`/account/orders/track/${order.order_id}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Navigation size={15} />
          Track order
        </Link>
      )}
    </div>
  );
}