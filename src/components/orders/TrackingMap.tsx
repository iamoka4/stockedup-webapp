"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Point {
  lat: number;
  lng: number;
}

// Awka, used until the first real position arrives.
const DEFAULT_CENTER: L.LatLngTuple = [6.2104, 7.0676];

const riderIcon = L.divIcon({
  className: "",
  html: '<div style="background:#3498db;width:34px;height:34px;border-radius:17px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:16px">🛵</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destIcon = L.divIcon({
  className: "",
  html: '<div style="background:#ff7c09;width:28px;height:28px;border-radius:14px 14px 14px 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

/** Leaflet map with a rider marker and a destination marker. Client only. */
export default function TrackingMap({
  rider,
  dest,
}: {
  rider: Point | null;
  dest: Point | null;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);
  const destRef = useRef<L.Marker | null>(null);
  const fittedBothRef = useRef(false);

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current).setView(DEFAULT_CENTER, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      riderRef.current = null;
      destRef.current = null;
      fittedBothRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (rider) {
      if (!riderRef.current) {
        riderRef.current = L.marker([rider.lat, rider.lng], { icon: riderIcon }).addTo(map);
      } else {
        riderRef.current.setLatLng([rider.lat, rider.lng]);
      }
    }

    if (dest) {
      if (!destRef.current) {
        destRef.current = L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(map);
      } else {
        destRef.current.setLatLng([dest.lat, dest.lng]);
      }
    }

    // Frame both markers once. After that, leave the view alone so the
    // map doesn't snap back every few seconds while the user is panning.
    if (rider && dest) {
      if (!fittedBothRef.current) {
        map.fitBounds(
          [
            [rider.lat, rider.lng],
            [dest.lat, dest.lng],
          ],
          { padding: [60, 60] }
        );
        fittedBothRef.current = true;
      }
    } else if (rider || dest) {
      const p = (rider ?? dest) as Point;
      map.setView([p.lat, p.lng], 15);
    }
  }, [rider?.lat, rider?.lng, dest?.lat, dest?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} className="size-full" />;
}