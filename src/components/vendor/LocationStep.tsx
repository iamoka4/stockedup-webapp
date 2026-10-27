"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { updateVendorLocation } from "@/lib/api/vendor";
import {
  SUPPORTED_CITIES,
  findCityFromText,
  resolveCityFromCoords,
} from "@/lib/vendor/cities";
import { ErrorBanner, PrimaryButton, errorMessage } from "./ui";

const ShopLocationMap = dynamic(() => import("./ShopLocationMap"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-2xl bg-bg" />,
});

export function LocationStep({
  initialCity,
  onDone,
}: {
  initialCity?: string | null;
  onDone: () => void;
}) {
  // The map opens on the vendor's registration city (Awka if unrecognised).
  const startCity = useMemo(
    () => findCityFromText(initialCity ?? "") ?? SUPPORTED_CITIES[0],
    [initialCity]
  );

  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The city is decided by where the pin is, same as the mobile app.
  const detected = useMemo(
    () => (pin ? resolveCityFromCoords(pin.lat, pin.lng) : null),
    [pin]
  );
  const unsupported = !!pin && !detected;

  function useMyLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Your browser can't share your location. Tap the map to place the pin instead.");
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsBusy(false);
      },
      (err) => {
        setGpsBusy(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser settings, or tap the map to place the pin."
            : "Couldn't get your location. Tap the map to place the pin instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleConfirm() {
    setError(null);
    if (!pin) {
      setError("Place a pin on your shop location first.");
      return;
    }
    if (!detected) {
      setError(
        "StockedUp isn't available in this area yet. Move the pin to your correct shop location."
      );
      return;
    }
    setBusy(true);
    try {
      await updateVendorLocation({
        latitude: Number(pin.lat.toFixed(6)),
        longitude: Number(pin.lng.toFixed(6)),
        city: detected.key,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-soft">
        Pin your exact shop so customers get accurate delivery fees. Tap the map to drop the pin,
        then drag it to fine-tune.
      </p>

      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={useMyLocation}
        disabled={gpsBusy}
        className="inline-flex rounded-full border border-line bg-bg px-5 py-2.5 text-sm font-bold transition hover:border-brand disabled:opacity-60"
      >
        {gpsBusy ? "Locating…" : "Use my location"}
      </button>

      <ShopLocationMap
        centerLat={startCity.lat}
        centerLng={startCity.lng}
        pin={pin}
        onPinChange={(lat, lng) => setPin({ lat, lng })}
      />

      <p className="text-center text-xs text-ink-soft">
        {pin ? "Drag the pin to fine-tune your exact shop position." : "No pin placed yet."}
      </p>

      {pin && (
        <div className="flex justify-center">
          {detected ? (
            <span className="rounded-full border border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint px-4 py-1.5 text-sm font-semibold text-green-800 dark:text-leaf">
              📍 {detected.label}
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 dark:border-brand bg-amber-50 dark:bg-brand-tint px-4 py-1.5 text-sm font-semibold text-amber-800 dark:text-brand">
              ⚠ Area not yet supported
            </span>
          )}
        </div>
      )}

      <PrimaryButton
        type="button"
        onClick={handleConfirm}
        busy={busy}
        disabled={!pin || unsupported}
      >
        Finish setup
      </PrimaryButton>
    </div>
  );
}