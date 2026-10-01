import { apiGet } from "./client";
import { DEFAULT_CITY } from "@/lib/config";

// Shape mirrors IVendorListingItem as the mobile listing screen uses it.
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
  delivery: { estimate: number | null };
}

// apiGet already unwraps the PHP envelope, so these payloads are the `data`
// object itself: { restaurants, cuisines, total } and
// { supermarkets, categories, total }.
interface RestaurantsData {
  restaurants?: VendorListingItem[];
}
interface SupermarketsData {
  supermarkets?: VendorListingItem[];
}

// Same params the mobile hooks send. The server has no user location, so
// customer_latitude/longitude are omitted and distance_km will be null.
export async function getRestaurants(
  city: string = DEFAULT_CITY
): Promise<VendorListingItem[]> {
  const data = await apiGet<RestaurantsData>("/get-restaurants.php", { city });
  return data?.restaurants ?? [];
}

export async function getSupermarkets(
  city: string = DEFAULT_CITY
): Promise<VendorListingItem[]> {
  const data = await apiGet<SupermarketsData>("/get-supermarkets.php", { city });
  return data?.supermarkets ?? [];
}