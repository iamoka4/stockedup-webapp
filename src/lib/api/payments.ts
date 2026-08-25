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

  customer_latitude: number;
  customer_longitude: number;

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

export function initializePayment(
  amount: number,
  metadata: CheckoutMetadata
): Promise<InitializePaymentResult> {
  return apiRequest("/initialize-payment.php", {
    method: "POST",
    body: { amount, metadata },
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
