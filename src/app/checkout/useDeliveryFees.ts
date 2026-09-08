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
 * cart needs one call per vendor — still necessary, since each vendor's
 * individual delivery eligibility (out-of-range check) has to be
 * validated separately; any one ineligible vendor should still surface
 * an error here, same as processOrder() enforces server-side.
 *
 * FIX: the order-level delivery fee is no longer the SUM of every
 * vendor's quote. Per StockedUp policy, a multi-vendor order is still
 * ONE delivery leg from the buyer's side and must be priced as ONE quote
 * — matching processOrder() in OrderController.php, which takes the
 * MINIMUM quote across the order's vendors as the actual charge (see its
 * comments re: order #57, where the old summing logic overcharged
 * ₦4,000 instead of ₦2,000 for a 2-vendor cart). This hook was still
 * summing, so checkout was showing a phantom total the customer would
 * never actually be charged. Take the minimum here too so the estimate
 * shown at checkout matches what processOrder() will actually charge.
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

  const total = fees.length > 0 ? Math.min(...fees.map((f) => f.total)) : 0;
  return { fees, total, loading, error };
}