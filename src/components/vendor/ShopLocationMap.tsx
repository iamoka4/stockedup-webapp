"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  centerLat: number;
  centerLng: number;
  pin: { lat: number; lng: number } | null;
  onPinChange: (lat: number, lng: number) => void;
}

// Same orange teardrop pin as the mobile app (no image assets needed).
const pinIcon = L.divIcon({
  className: "",
  html: '<div style="background:#FF7C09;width:28px;height:28px;border-radius:14px 14px 14px 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function ShopLocationMap({ centerLat, centerLng, pin, onPinChange }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const callbackRef = useRef(onPinChange);

  useEffect(() => {
    callbackRef.current = onPinChange;
  }, [onPinChange]);

  // Create the map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current).setView(
      pin ? [pin.lat, pin.lng] : [centerLat, centerLng],
      pin ? 16 : 13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => callbackRef.current(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once
  }, []);

  // Move the map when the chosen city changes and no pin has been placed yet.
  useEffect(() => {
    if (!pin) mapRef.current?.setView([centerLat, centerLng], 13);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to city changes
  }, [centerLat, centerLng]);

  // Keep the marker in sync with the pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pin) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon, draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        callbackRef.current(p.lat, p.lng);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([pin.lat, pin.lng]);
    }
    // Pin placed far away (e.g. from GPS): bring it into view.
    if (!map.getBounds().contains([pin.lat, pin.lng])) {
      map.setView([pin.lat, pin.lng], 16);
    }
  }, [pin]);

  return (
    <div
      ref={elRef}
      className="isolate z-0 h-80 w-full overflow-hidden rounded-2xl border border-line"
    />
  );
}