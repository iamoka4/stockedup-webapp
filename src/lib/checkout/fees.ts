/**
 * Mirrors calculateProcessingFee() in controllers/OrderController.php.
 *
 * IMPORTANT: this exists only to show the customer an accurate total
 * before they pay — the backend is always the authority on the real
 * charge (processOrder() recomputes this server-side from scratch, and
 * webhook.php independently validates against it too, per the audit).
 * If OrderController.php's tiers or rates ever change, this function
 * must be updated to match, or the amount shown at checkout will drift
 * from what the backend actually charges/records as the order total.
 */
const TIER2_MIN = 20000;
const TIER3_MIN = 100000;
const TIER4_MIN = 1000000;
const RATE_LOW = 0.1;
const CAP_MID = 2000;
const RATE_HIGH = 0.035;
const RATE_HIGHEST = 0.025;

export function calculateProcessingFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= TIER4_MIN) return Math.round(subtotal * RATE_HIGHEST);
  if (subtotal >= TIER3_MIN) return Math.round(subtotal * RATE_HIGH);
  if (subtotal >= TIER2_MIN) return Math.round(CAP_MID);
  return Math.round(subtotal * RATE_LOW);
}

export function calculateOrderTotal(
  subtotal: number,
  deliveryFee: number,
  discountAmount: number
): { processingFee: number; total: number } {
  const processingFee = calculateProcessingFee(subtotal);
  const total = Math.max(1, Math.round(subtotal + processingFee + deliveryFee - discountAmount));
  return { processingFee, total };
}
