import { apiRequest, apiUpload } from "./client";

/**
 * ⚠ SET THIS to the real filename of the update-location PHP endpoint
 * (the one that validates latitude/longitude/city and updates vendors).
 * I couldn't see its name or the useUpdateVendorLocation hook, so this
 * is a placeholder.
 */
export const UPDATE_LOCATION_PATH = "/update-vendor-location.php";

export interface ShopProfile {
  business_name?: string | null;
  shop_name?: string | null;
  description?: string | null;
  phone_number?: string | null;
  email?: string | null;
  owner?: { phone?: string | null; email?: string | null } | null;
  location?: string | null;
  store_address?: string | null;
  city?: string | null;
  state?: string | null;
  profile_pic?: string | null;
  cover_photo?: string | null;
  status?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export function getShopProfile(): Promise<ShopProfile> {
  return apiRequest<ShopProfile>("/get-shop-profile.php");
}

export function saveShopProfile(input: {
  storeName: string;
  description: string;
  location: string;
  phoneNumber: string;
  email: string;
  logo?: File;
  cover?: File;
}): Promise<Record<string, unknown>> {
  // Field names match save-shop-profile.php exactly.
  const form = new FormData();
  form.append("store_name", input.storeName);
  form.append("description", input.description);
  form.append("location", input.location);
  form.append("phone_number", input.phoneNumber);
  form.append("email", input.email);
  if (input.logo) form.append("image", input.logo); // -> vendors.shop_logo
  if (input.cover) form.append("cover_image", input.cover); // -> vendors.store_image
  return apiUpload<Record<string, unknown>>("/save-shop-profile.php", form);
}

export function updateVendorLocation(input: {
  latitude: number;
  longitude: number;
  city: string; // lowercase supported-city key, e.g. "portharcourt"
}): Promise<{ latitude: number; longitude: number; city: string }> {
  return apiRequest(UPDATE_LOCATION_PATH, { method: "POST", body: input });
}

/** Shop name, description and address have been saved. */
export function isProfileComplete(p: ShopProfile): boolean {
  return !!(p.description?.trim() && p.location?.trim());
}

/**
 * True when the shop pin hasn't been set. Only enforced when the profile
 * endpoint reports coordinates at all (the "latitude" key exists);
 * null, empty and 0 all count as "not set".
 */
export function needsLocation(p: ShopProfile): boolean {
  if (!("latitude" in p)) return false;
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  return !(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0);
}

export function isOnboardingComplete(p: ShopProfile): boolean {
  return isProfileComplete(p) && !needsLocation(p);
}