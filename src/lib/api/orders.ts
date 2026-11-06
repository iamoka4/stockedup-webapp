import { apiGet, apiRequest } from "./client";
import type { Order } from "./types";

export type { Order };

/**
 * One store in an order, flagged with whether this buyer already reviewed it
 * (a store is reviewed only once per buyer, ever). Returned by get-orders.php.
 * Add the matching optional fields to `Order` in ./types:
 *   vendors?: OrderVendor[];  store_name?: string;  vendor_reviewed?: boolean;
 */
export interface OrderVendor {
  vendor_id: number;
  name: string;
  reviewed: boolean;
}

export function getOrders(): Promise<{ orders: Order[] }> {
  return apiGet("/get-orders.php");
}

export function cancelOrder(orderId: number): Promise<unknown> {
  return apiRequest("/cancel-order.php", {
    method: "POST",
    body: { order_id: orderId },
  });
}

// ── Delivery PIN + delivery status (get-order-tracking.php) ────────────────
export interface OrderTrackingInfo {
  order_id: number;
  order_uid: string;
  status: string;
  /** null | "rider_assigned" | "delivered" | "failed" */
  delivery_status: string | null;
  /** Only present while the order is active; null once finished. */
  delivery_pin: string | null;
}

export function getOrderTracking(orderId: number): Promise<OrderTrackingInfo> {
  return apiGet("/get-order-tracking.php", { order_id: orderId });
}

// ── Live rider position (get-order-tracking-location.php) ──────────────────
export interface RiderInfo {
  name: string;
  phone: string | null;
  vehicle_type: string | null;
  latitude: number;
  longitude: number;
  location_updated_at: string | null;
}

export interface TrackingLocation {
  delivery_status: string | null;
  rider: RiderInfo | null;
  customer_location: { latitude: number; longitude: number } | null;
  distance_km: number | null;
}

export function getOrderTrackingLocation(orderId: number): Promise<TrackingLocation> {
  return apiGet("/get-order-tracking-location.php", { order_id: orderId });
}

// ── Reviews (submit-review.php) ────────────────────────────────────────────
export interface ProductReviewPayload {
  product_id: number;
  rating: number;
  /** Optional written review, max 1000 chars (enforced by submit-review.php). */
  review_text: string;
}

/** A rating for ONE store in the order. Leave a store out to skip rating it. */
export interface StoreRatingPayload {
  vendor_id: number;
  rating: number;
  /** Optional written store review, max 1000 chars. */
  comment?: string;
}

export interface ReviewPayload {
  order_id: number;
  /**
   * One entry per store being rated. A store is rated once per buyer, ever;
   * submit-review.php silently skips stores already rated.
   */
  vendor_ratings?: StoreRatingPayload[];
  /** Older single-store fields, still accepted by the server. Prefer vendor_ratings. */
  vendor_id?: number | null;
  vendor_rating?: number | null;
  vendor_comment?: string;
  product_reviews: ProductReviewPayload[];
}

export function submitReview(payload: ReviewPayload): Promise<unknown> {
  return apiRequest("/submit-review.php", { method: "POST", body: payload });
}