"use client";

import { useEffect, useState } from "react";
import { getProcessingFee } from "@/lib/api/addresses";

export function useProcessingFee(subtotal: number) {
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subtotal <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFee(0);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProcessingFee(subtotal)
      .then((r) => {
        if (!cancelled) setFee(r.processing_fee);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't calculate processing fee");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subtotal]);

  return { fee, loading, error };
}