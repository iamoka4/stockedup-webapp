import { apiGet, apiRequest } from "./client";
import type { Order } from "./types";

export type { Order };

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
export interface ReviewPayload {
  order_id: number;
  vendor_id: number | null;
  vendor_rating: number | null;
  product_reviews: { product_id: number; rating: number; review_text: string }[];
}

export function submitReview(payload: ReviewPayload): Promise<unknown> {
  return apiRequest("/submit-review.php", { method: "POST", body: payload });
}