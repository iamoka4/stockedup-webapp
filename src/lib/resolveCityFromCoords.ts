/**
 * resolveCityFromCoords
 *
 * Given a lat/lng, returns the StockedUp city slug ('awka', 'portharcourt', etc.)
 * if the point falls within that city's supported radius, or null if the
 * location isn't in any supported city.
 *
 * This runs CLIENT-SIDE so the city badge updates instantly as the pin moves,
 * without needing a network round-trip.
 *
 * The SINGLE SOURCE OF TRUTH for these values remains delivery_config.php on
 * the backend. Keep these two in sync when you add a new city.
 */

// ── Supported cities ──────────────────────────────────────────────────────────

interface CityConfig {
  slug:              string;
  label:             string;
  lat:               number;
  lng:               number;
  /** Rough bounding radius used for city detection only (not delivery pricing) */
  detectionRadiusKm: number;
}

const SUPPORTED_CITIES: CityConfig[] = [
  // ── Anambra ────────────────────────────────────────────────────────────────
  { slug: 'awka',         label: 'Awka',          lat: 6.2108,  lng: 7.0670,  detectionRadiusKm: 15 },
  { slug: 'nnewi',        label: 'Nnewi',         lat: 6.0059,  lng: 6.9986,  detectionRadiusKm: 12 },
  { slug: 'onitsha',      label: 'Onitsha',       lat: 6.1428,  lng: 6.7877,  detectionRadiusKm: 15 },
  { slug: 'oko',          label: 'Oko',           lat: 6.0833,  lng: 6.9833,  detectionRadiusKm: 10 },
  { slug: 'ekwulobia',    label: 'Ekwulobia',     lat: 6.0761,  lng: 7.1128,  detectionRadiusKm: 10 },

  // ── Enugu ──────────────────────────────────────────────────────────────────
  { slug: 'enugu',        label: 'Enugu',         lat: 6.4584,  lng: 7.5464,  detectionRadiusKm: 20 },

  // ── Rivers ─────────────────────────────────────────────────────────────────
  { slug: 'portharcourt', label: 'Port Harcourt', lat: 4.8156,  lng: 7.0498,  detectionRadiusKm: 25 },

  // ── Delta ──────────────────────────────────────────────────────────────────
  { slug: 'asaba',        label: 'Asaba',         lat: 6.1986,  lng: 6.7357,  detectionRadiusKm: 15 },
  { slug: 'warri',        label: 'Warri',         lat: 5.5167,  lng: 5.7500,  detectionRadiusKm: 18 },

  // ── Imo ───────────────────────────────────────────────────────────────────
  { slug: 'owerri',       label: 'Owerri',        lat: 5.4836,  lng: 7.0333,  detectionRadiusKm: 18 },

  // ── Abia ──────────────────────────────────────────────────────────────────
  { slug: 'aba',          label: 'Aba',           lat: 5.1066,  lng: 7.3667,  detectionRadiusKm: 18 },

  // ── Edo ───────────────────────────────────────────────────────────────────
  { slug: 'benin',        label: 'Benin City',    lat: 6.3350,  lng: 5.6270,  detectionRadiusKm: 20 },
];

// ── Haversine (client-side) ───────────────────────────────────────────────────

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

// ── Resolver ──────────────────────────────────────────────────────────────────

/**
 * Returns the slug of the nearest supported city if within its detection
 * radius, otherwise null.
 *
 * Async signature kept for future-proofing (e.g. swap to a geocoding API
 * call without changing callers).
 */
export async function resolveCityFromCoords(
  lat: number,
  lng: number
): Promise<string | null> {
  let nearest: { slug: string; distance: number } | null = null;

  for (const city of SUPPORTED_CITIES) {
    const distance = haversineKm(lat, lng, city.lat, city.lng);
    if (distance <= city.detectionRadiusKm) {
      if (!nearest || distance < nearest.distance) {
        nearest = { slug: city.slug, distance };
      }
    }
  }

  return nearest?.slug ?? null;
}

/**
 * Returns all supported city slugs – useful for dropdowns / validation.
 */
export function getSupportedCities(): CityConfig[] {
  return SUPPORTED_CITIES;
}