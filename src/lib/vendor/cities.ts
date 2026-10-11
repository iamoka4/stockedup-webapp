export interface SupportedCity {
  key: string;
  label: string;
  state: string;
  lat: number;
  lng: number;
  /** Rough radius used for city detection only (not delivery pricing). */
  detectionRadiusKm: number;
}

/**
 * Mirror of the mobile app's resolveCityFromCoords.ts (and ultimately
 * delivery_config.php on the backend). `key` must match $supportedCities in
 * the update-location endpoint exactly. Keep all of these in sync when a
 * city is added.
 */
export const SUPPORTED_CITIES: SupportedCity[] = [
  // Anambra
  { key: "awka", label: "Awka", state: "Anambra", lat: 6.2108, lng: 7.067, detectionRadiusKm: 15 },
  { key: "nnewi", label: "Nnewi", state: "Anambra", lat: 6.0059, lng: 6.9986, detectionRadiusKm: 12 },
  { key: "onitsha", label: "Onitsha", state: "Anambra", lat: 6.1428, lng: 6.7877, detectionRadiusKm: 15 },
  { key: "oko", label: "Oko", state: "Anambra", lat: 6.0833, lng: 6.9833, detectionRadiusKm: 10 },
  { key: "ekwulobia", label: "Ekwulobia", state: "Anambra", lat: 6.0761, lng: 7.1128, detectionRadiusKm: 10 },
  // Enugu
  { key: "enugu", label: "Enugu", state: "Enugu", lat: 6.4584, lng: 7.5464, detectionRadiusKm: 20 },
  // Rivers
  { key: "portharcourt", label: "Port Harcourt", state: "Rivers", lat: 4.8156, lng: 7.0498, detectionRadiusKm: 25 },
  // Delta
  { key: "asaba", label: "Asaba", state: "Delta", lat: 6.1986, lng: 6.7357, detectionRadiusKm: 15 },
  { key: "warri", label: "Warri", state: "Delta", lat: 5.5167, lng: 5.75, detectionRadiusKm: 18 },
  // Imo
  { key: "owerri", label: "Owerri", state: "Imo", lat: 5.4836, lng: 7.0333, detectionRadiusKm: 18 },
  // Abia
  { key: "aba", label: "Aba", state: "Abia", lat: 5.1066, lng: 7.3667, detectionRadiusKm: 18 },
  // Edo
  { key: "benin", label: "Benin City", state: "Edo", lat: 6.335, lng: 5.627, detectionRadiusKm: 20 },
];

/** "Port Harcourt" -> "portharcourt". Letters only, lowercase. */
export function normalizeCityKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

export function findCityByKey(key: string): SupportedCity | undefined {
  return SUPPORTED_CITIES.find((c) => c.key === key);
}

/** Matches free text ("Port Harcourt", "awka", "Benin City") to a supported city. */
export function findCityFromText(text: string): SupportedCity | undefined {
  const n = normalizeCityKey(text);
  if (!n) return undefined;
  return SUPPORTED_CITIES.find(
    (c) => c.key === n || normalizeCityKey(c.label) === n
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Nearest supported city whose detection radius contains the point, or null
 * if the point isn't in any supported city. Same rule as the mobile app.
 */
export function resolveCityFromCoords(lat: number, lng: number): SupportedCity | null {
  let nearest: { city: SupportedCity; distance: number } | null = null;
  for (const city of SUPPORTED_CITIES) {
    const distance = haversineKm(lat, lng, city.lat, city.lng);
    if (distance <= city.detectionRadiusKm && (!nearest || distance < nearest.distance)) {
      nearest = { city, distance };
    }
  }
  return nearest?.city ?? null;
}