import { DEFAULT_CITY } from "@/lib/config";
import type { Coords } from "./geolocation";

export interface ServiceArea {
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

// TODO: replace with the backend's own city/service-area data (e.g. what
// city_delivery_config knows) once it's exposed to the web. Until then this
// is the single place that decides "which StockedUp city is this person in".
// Coordinates are approximate (central Awka) and the radius is a placeholder.
export const SERVICE_AREAS: ServiceArea[] = [
  { city: DEFAULT_CITY, latitude: 6.2104, longitude: 7.0741, radiusKm: 25 },
];

function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The nearest service area that contains the point, or null if StockedUp
// doesn't serve where the person is.
export function resolveServiceArea(coords: Coords): ServiceArea | null {
  let best: ServiceArea | null = null;
  let bestDistance = Infinity;
  for (const area of SERVICE_AREAS) {
    const d = distanceKm(coords, area);
    if (d <= area.radiusKm && d < bestDistance) {
      best = area;
      bestDistance = d;
    }
  }
  return best;
}