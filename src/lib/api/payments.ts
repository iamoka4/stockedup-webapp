import { apiRequest } from "./client";

interface InitializePaymentResult {
  /** Present when Paystack charge is needed (partial or full card/bank payment). */
  access_code?: string | null;
  authorization_url?: string | null;
  /** Always present: either a Paystack reference or a synthetic WALLET_ ref. */
  reference: string;
  /** Only present when the order was fully covered by wallet balance (no Paystack step). */
  order_id?: string;
}

/** Add-on chosen on a cart line. Deleted options (null id) are filtered out before sending. */
export interface CheckoutItemAddon {
  addon_option_id: number;
  quantity: number;
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
  /** Base unit price, add-ons excluded (same as mobile). */
  price: number;
  addons?: CheckoutItemAddon[];
  /** Per-item note, written on the product details page. */
  special_request?: string | null;
}

export interface CheckoutMetadata {
  items: CheckoutItem[];
  shipping_address: string;
  /**
   * Not used by the backend for pricing: processOrder() computes the
   * delivery fee itself from vendor + customer coordinates. Kept only in
   * case display/logging code still reads it.
   */
  delivery_fee?: number;
  voucher_code?: string | null;
  discount_amount?: number;
  order_type?: "instant" | "scheduled";
  scheduled_for?: string | null;
  scheduled_slot_id?: string | null;
  use_wallet_balance?: boolean;
  idempotency_key: string;
  // customer_notes removed: notes are now per item (special_request).
}

/**
 * initialize-payment.php REQUIRES customer_latitude/customer_longitude,
 * sent at the top level of the request body, and rejects the request with
 * 400 if they're missing.
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