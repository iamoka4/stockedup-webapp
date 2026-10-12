"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { getSupportedCities, resolveCityFromCoords } from "@/lib/resolveCityFromCoords";

export type ShopLocation = { latitude: number; longitude: number; city: string };

const AWKA = { latitude: 6.2108, longitude: 7.067 };

type Props = {
  initialLocation?: ShopLocation | null;
  onConfirm: (loc: ShopLocation) => void;
  confirmLabel?: string;
  busy?: boolean;
};

function cityLabel(slug: string) {
  return getSupportedCities().find((c) => c.slug === slug)?.label ?? slug;
}

export default function ShopLocationPicker({ initialLocation, onConfirm, confirmLabel, busy }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const placeMarkerRef = useRef<((lat: number, lng: number) => void) | null>(null);

  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude } : null,
  );
  const [city, setCity] = useState<string | null>(initialLocation?.city || null);
  const [cityLoading, setCityLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init the map once (Leaflet needs `window`, so it's imported dynamically)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const start = initialLocation ?? AWKA;
      const map = L.map(containerRef.current).setView([start.latitude, start.longitude], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:var(--color-brand,#0CCC3C);width:28px;height:28px;border-radius:14px 14px 14px 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const placeMarker = (lat: number, lng: number) => {
        if (!markerRef.current) {
          const m = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
          m.on("dragend", () => {
            const p = m.getLatLng();
            setError(null);
            setPin({ latitude: p.lat, longitude: p.lng });
          });
          markerRef.current = m;
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
      };
      placeMarkerRef.current = placeMarker;

      map.on("click", (e: any) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
        setError(null);
        setPin({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      });

      if (initialLocation) placeMarker(initialLocation.latitude, initialLocation.longitude);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      placeMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve city slug whenever the pin moves (client-side, instant)
  useEffect(() => {
    if (!pin) return;
    let cancelled = false;
    setCityLoading(true);
    resolveCityFromCoords(pin.latitude, pin.longitude)
      .then((c) => !cancelled && setCity(c))
      .catch(() => !cancelled && setCity(null))
      .finally(() => !cancelled && setCityLoading(false));
    return () => {
      cancelled = true;
    };
  }, [pin]);

  function useMyLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access. Please place the pin manually.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        placeMarkerRef.current?.(latitude, longitude);
        mapRef.current?.setView([latitude, longitude], 16, { animate: true });
        setPin({ latitude, longitude });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Allow it in your browser settings, or place the pin manually."
            : "Could not get your location. Please try again or place the pin manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function confirm() {
    if (!pin) return setError("Please place a pin on your shop location first.");
    if (!city) {
      return setError(
        "StockedUp is not yet available in this area. Please move the pin to your correct shop location.",
      );
    }
    setError(null);
    onConfirm({ ...pin, city });
  }

  const unsupported = !!pin && !cityLoading && !city;
  const disabled = !pin || unsupported || cityLoading || busy;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="relative z-0 h-[420px] overflow-hidden rounded-2xl border border-line bg-gray-100 lg:h-[560px]">
        <div ref={containerRef} className="size-full" />
      </div>

      <div className="space-y-4 self-start rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Pin your shop</h2>
        <p className="text-[13px] leading-5 text-gray-500">
          {pin
            ? "Drag the pin or click elsewhere on the map to fine-tune your exact shop position."
            : "Click the map or use your current location to place your shop pin."}
        </p>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={gpsLoading}
          className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {gpsLoading ? "Locating…" : "Use My Location"}
        </button>

        {pin && (
          <div className="rounded-xl bg-gray-50 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Coordinates</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
            </p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">City</p>
            <span
              className={`mt-1.5 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold ${
                unsupported
                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {cityLoading ? "Checking…" : unsupported ? "⚠ Area not yet supported" : `📍 ${cityLabel(city!)}`}
            </span>
          </div>
        )}

        {error && <p className="rounded-xl bg-red-50 p-3 text-[13px] leading-5 text-red-700">{error}</p>}

        <button
          type="button"
          onClick={confirm}
          disabled={disabled}
          className="w-full rounded-xl bg-brand py-3.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : (confirmLabel ?? "Confirm Shop Location")}
        </button>
      </div>
    </div>
  );
}