"use client";

import { useEffect, useState } from "react";
import { getCheckoutQuote, type CheckoutQuote } from "@/lib/api/checkout";
import type { CheckoutItem } from "@/lib/api/payments";

export function useCheckoutQuote(params: {
  enabled: boolean;
  items: CheckoutItem[];
  latitude?: number;
  longitude?: number;
  /** The locked delivery quote shown to the customer (from useDeliveryFees). */
  quoteId: string | null;
  voucherCode: string | null;
}) {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify([
    params.items,
    params.latitude,
    params.longitude,
    params.quoteId,
    params.voucherCode,
  ]);

  useEffect(() => {
    if (
      !params.enabled ||
      params.latitude == null ||
      params.longitude == null ||
      params.items.length === 0
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Small delay so quick changes (voucher typing, address changes) make one request.
    const timer = setTimeout(() => {
      getCheckoutQuote({
        items: params.items,
        latitude: params.latitude as number,
        longitude: params.longitude as number,
        quoteId: params.quoteId,
        voucherCode: params.voucherCode,
      })
        .then((q) => {
          if (!cancelled) setQuote(q);
        })
        .catch((err) => {
          if (cancelled) return;
          setQuote(null);
          setError(err instanceof Error ? err.message : "Couldn't calculate your total.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, params.enabled]);

  return { quote, loading, error };
}