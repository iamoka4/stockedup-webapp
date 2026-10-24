import { apiRequest } from "./client";
import { API_BASE_URL } from "@/lib/config";
import type { UserAddress, DeliveryFeeResult, ProcessingFeeResult } from "./types";

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
 *
 * Single-vendor estimate. Checkout no longer uses this: it asks for ONE quote
 * for the whole cart with getDeliveryQuote() below, exactly like the mobile app.
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

/**
 * One consolidated delivery quote for every vendor in the cart (KoulriaGo
 * multi-pickup pricing), the same call the mobile app makes. The returned
 * quote_id MUST be sent with the payment: the backend locks that exact quote
 * and charges its fee, so the fee shown at checkout is the fee charged.
 */
export interface DeliveryQuote {
  eligible: boolean;
  quote_id: string;
  distance_km: number;
  pickup_count: number;
  pricing_method: string;
  base_fee: number;
  distance_fee: number;
  pickup_fee: number;
  total: number;
  currency: string;
  expires_at: string;
}

export async function getDeliveryQuote(
  vendor_ids: number[],
  customer_latitude: number,
  customer_longitude: number
): Promise<DeliveryQuote> {
  const res = await fetch(`${API_BASE_URL}/delivery-fee.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vendor_ids,
      customer_latitude,
      customer_longitude,
    }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(
      (typeof json.error === "string" ? json.error : json.error?.message) ||
        "Couldn't calculate delivery fee"
    );
  }

  return json as DeliveryQuote;
}

/**
 * Reads the live processing_fee_tiers config (System Config → Processing
 * Fees) via calculateProcessingFeeFromConfig() — the same source of truth
 * OrderController.php and webhook.php use. Do not hardcode tiers on the
 * frontend; see lib/checkout/fees.ts for why.
 */
export async function getProcessingFee(subtotal: number): Promise<ProcessingFeeResult> {
  const res = await fetch(`${API_BASE_URL}/processing-fee.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subtotal }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error || "Couldn't calculate processing fee");
  }

  return json as ProcessingFeeResult;
}