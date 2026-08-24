"use client";

import { useEffect, useState } from "react";
import { getDeliveryFee } from "@/lib/api/addresses";
import type { Coordinates } from "@/lib/hooks/useGeolocation";

interface VendorFee {
  vendor_id: number;
  total: number;
  distance_km: number;
}

/**
 * delivery-fee.php takes a single vendor_id per call, so a multi-vendor
 * cart needs one call per vendor. The sum is what gets sent as the order's
 * overall delivery_fee — processOrder() then splits that evenly across
 * vendors internally, which matches this being an aggregate figure rather
 * than something we need to keep pre-split on the frontend.
 */
export function useDeliveryFees(vendorIds: number[], coords: Coordinates | null) {
  const [fees, setFees] = useState<VendorFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords || vendorIds.length === 0) {
      // Resetting fees when the dependency set becomes empty is the sync
      // this effect exists for (no coords / no items means no fee to show).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFees([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      vendorIds.map((id) =>
        getDeliveryFee(id, coords.latitude, coords.longitude).then((r) => ({
          vendor_id: id,
          total: r.total,
          distance_km: r.distance_km,
        }))
      )
    )
      .then((results) => {
        if (!cancelled) setFees(results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't calculate delivery fee");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coords, vendorIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = fees.reduce((sum, f) => sum + f.total, 0);
  return { fees, total, loading, error };
}
