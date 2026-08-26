import { apiRequest } from "./client";
import { API_BASE_URL } from "@/lib/config";
import type { UserAddress, DeliveryFeeResult } from "./types";

export function getUserAddresses(): Promise<{ address: UserAddress[] }> {
  return apiRequest("/get-user-address.php", { method: "GET" });
}

export function saveUserAddress(input: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
}): Promise<{ address: UserAddress }> {
  return apiRequest("/save-user-address.php", { method: "POST", body: input });
}

/**
 * Requires the customer's live coordinates (browser Geolocation API), not
 * their saved address — this mirrors how the mobile app calls it, since
 * user_addresses has no lat/lng. See useDeliveryFee() for the geolocation
 * + manual-pin fallback flow.
 */
export async function getDeliveryFee(
  vendor_id: number,
  customer_latitude: number,
  customer_longitude: number
): Promise<DeliveryFeeResult> {
  const res = await fetch(`${API_BASE_URL}/delivery-fee.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vendor_id,
      customer_latitude,
      customer_longitude,
    }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error || "Couldn't calculate delivery fee");
  }

  return json as DeliveryFeeResult;
}
