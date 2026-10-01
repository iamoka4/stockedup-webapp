import { apiGet } from "./client";
import { DEFAULT_CITY } from "@/lib/config";
import type { Coords } from "@/lib/location/geolocation";

// Shape mirrors IVendorListingItem as the mobile listing screen uses it,
// plus delivers_here from vendor-listing-shared.php.
export interface VendorListingItem {
  id: number;
  shop_name: string;
  status: string; // "open" | "closed"
  cover_image: string | null;
  logo: string | null;
  city: string | null;
  state: string | null;
  distance_km: number | null;
  rating: { average: number | null };
  delivery: {
    // Base fee only when distance is unknown; base + per-km once it is.
    estimate: number | null;
    // false = outside this city's delivery radius for the given customer
    // location; null = can't tell (no customer location or no city config).
    delivers_here: boolean | null;
  };
}

// apiGet already unwraps the PHP envelope, so these payloads are the `data`
// object itself: { restaurants, cuisines, total } and
// { supermarkets, categories, total }.
interface ListData {
  restaurants?: VendorListingItem[];
  supermarkets?: VendorListingItem[];
  total?: number;
}

// The endpoints default to 20 results and cap at 50 per request, so page
// through until we have everything (bounded as a safety net).
const PAGE_SIZE = 50;
const MAX_PAGES = 6;

async function fetchAll(
  path: string,
  key: "restaurants" | "supermarkets",
  city: string,
  coords?: Coords
): Promise<VendorListingItem[]> {
  const all: VendorListingItem[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await apiGet<ListData>(path, {
      city,
      customer_latitude: coords?.latitude,
      customer_longitude: coords?.longitude,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    const items = data?.[key] ?? [];
    all.push(...items);
    if (items.length < PAGE_SIZE || all.length >= (data?.total ?? 0)) break;
  }
  return all;
}

// Pass coords (from the browser's geolocation) to get distance_km, a
// distance-based delivery estimate and delivers_here.
export function getRestaurants(
  city: string = DEFAULT_CITY,
  coords?: Coords
): Promise<VendorListingItem[]> {
  return fetchAll("/get-restaurants.php", "restaurants", city, coords);
}

export function getSupermarkets(
  city: string = DEFAULT_CITY,
  coords?: Coords
): Promise<VendorListingItem[]> {
  return fetchAll("/get-supermarkets.php", "supermarkets", city, coords);
}