"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeliveryQuote, type DeliveryQuote } from "@/lib/api/addresses";
import type { Coordinates } from "@/lib/hooks/useGeolocation";

/**
 * ONE delivery quote for the whole cart, the same call the mobile app makes.
 *
 * Before, this hook asked for a separate estimate per vendor, showed the lowest,
 * and sent no quote id, so the backend charged a fee worked out from a
 * different configuration than the one shown. Now the customer sees the fee of
 * a locked KoulriaGo quote and the quote_id goes to the backend with the
 * payment, which charges exactly that quote.
 *
 * A quote only stays valid for a limited time (15 minutes by default), so the
 * hook refreshes it in the background and offers ensureFresh() for the moment
 * the customer taps Pay. Ages are measured with the browser clock from the time
 * the quote was fetched, so no server time zone is involved.
 */
const AUTO_REFRESH_MS = 8 * 60 * 1000; // refresh well before a 15-minute quote runs out
const STALE_AFTER_MS = 10 * 60 * 1000; // a quote older than this is refreshed before paying

export function useDeliveryFees(vendorIds: number[], coords: Coordinates | null) {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchedAt = useRef<number>(0);
  const requestId = useRef<number>(0);
  const idsRef = useRef<number[]>(vendorIds);
  idsRef.current = vendorIds;

  const idsKey = [...vendorIds].sort((a, b) => a - b).join(",");
  const lat = coords ? coords.latitude : null;
  const lng = coords ? coords.longitude : null;

  const fetchQuote = useCallback(async (): Promise<DeliveryQuote | null> => {
    const ids = idsRef.current;

    if (lat === null || lng === null || ids.length === 0) {
      setQuote(null);
      return null;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const q = await getDeliveryQuote(ids, lat, lng);

      if (id === requestId.current) {
        setQuote(q);
        fetchedAt.current = Date.now();
      }

      return q;
    } catch (err) {
      if (id === requestId.current) {
        setQuote(null);
        setError(err instanceof Error ? err.message : "Couldn't calculate delivery fee");
      }

      return null;
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, [idsKey, lat, lng]);

  // A new quote whenever the cart's vendors or the delivery location change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchQuote();
  }, [fetchQuote]);

  // Keep the quote fresh while the customer is on the page.
  useEffect(() => {
    if (lat === null || lng === null || idsKey === "") return;

    const timer = setInterval(() => {
      void fetchQuote();
    }, AUTO_REFRESH_MS);

    return () => clearInterval(timer);
  }, [fetchQuote, lat, lng, idsKey]);

  /**
   * Call right before paying. Returns the quote to pay with, and whether a new
   * one had to be fetched because the old one was getting old.
   */
  const ensureFresh = useCallback(async (): Promise<{ quote: DeliveryQuote | null; refreshed: boolean }> => {
    const stale = !quote || Date.now() - fetchedAt.current > STALE_AFTER_MS;

    if (!stale) {
      return { quote, refreshed: false };
    }

    const q = await fetchQuote();
    return { quote: q, refreshed: true };
  }, [quote, fetchQuote]);

  return {
    quote,
    quoteId: quote ? quote.quote_id : null,
    total: quote ? quote.total : 0,
    loading,
    error,
    refresh: fetchQuote,
    ensureFresh,
  };
}