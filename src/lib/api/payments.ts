import { apiRequest } from "./client";

interface InitializePaymentResult {
  /** Present when Paystack charge is needed (partial or full card/bank payment). */
  access_code?: string | null;
  authorization_url?: string | null;
  /** Always present — either a Paystack reference or a synthetic WALLET_ ref. */
  reference: string;
  /** Only present when the order was fully covered by wallet balance — no Paystack step needed. */
  order_id?: string;
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export interface CheckoutMetadata {
  items: CheckoutItem[];
  shipping_address: string;
  /**
   * No longer used by the backend for pricing — processOrder() now
   * computes delivery fee itself, authoritatively, from vendor +
   * customer coordinates. Kept here only in case any display/logging
   * code still reads it; safe to drop entirely later.
   */
  delivery_fee?: number;
  voucher_code?: string | null;
  discount_amount?: number;
  order_type?: "instant" | "scheduled";
  scheduled_for?: string | null;
  scheduled_slot_id?: string | null;
  customer_notes?: string | null;
  use_wallet_balance?: boolean;
  idempotency_key: string;
}

/**
 * initialize-payment.php now REQUIRES customer_latitude/customer_longitude
 * — sent at the top level of the request body, not just in metadata — and
 * rejects the request with 400 if they're missing. It computes delivery
 * fee itself server-side from these coordinates; the client no longer
 * supplies an authoritative delivery_fee.
 */
export function initializePayment(
  amount: number,
  metadata: CheckoutMetadata,
  customerLatitude: number,
  customerLongitude: number
): Promise<InitializePaymentResult> {
  return apiRequest("/initialize-payment.php", {
    method: "POST",
    body: {
      amount,
      metadata,
      customer_latitude: customerLatitude,
      customer_longitude: customerLongitude,
    },
  });
}

interface VerifyPaymentResult {
  status: string;
  reference: string;
  order_id: string;
}

export function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  return apiRequest(`/verify-payment.php?reference=${encodeURIComponent(reference)}`, {
    method: "GET",
  });
}