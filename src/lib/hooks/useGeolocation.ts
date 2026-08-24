"use client";

import { useState, useCallback } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type Status = "idle" | "locating" | "granted" | "denied" | "unsupported" | "manual";

/**
 * Requests the browser's live location for delivery-fee.php, which needs
 * customer_latitude/customer_longitude directly (confirmed during the
 * audit — user_addresses has no lat/lng, so a saved address alone can't
 * drive the fee calculation). Falls back to manual entry when permission
 * is denied or geolocation isn't available, which is common enough on web
 * that the UI should always offer it rather than dead-ending.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<Status>("idle");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setError(err.message);
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const setManual = useCallback((c: Coordinates) => {
    setCoords(c);
    setStatus("manual");
  }, []);

  return { status, coords, error, request, setManual };
}
