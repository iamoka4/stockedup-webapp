/**
 * Order total arithmetic only. The processing fee itself is NOT
 * calculated here — it used to be a hardcoded mirror of
 * OrderController.php's tiers, but OrderController.php now reads
 * processing_fee_tiers from the DB via calculateProcessingFeeFromConfig()
 * (System Config → Processing Fees), so any hardcoded copy here would
 * silently drift from whatever admins configure. Fetch the fee from
 * POST /processing-fee.php (see useProcessingFee) and pass it in.
 *
 * IMPORTANT: this exists only to show the customer an accurate total
 * before they pay — the backend is always the authority on the real
 * charge (processOrder() recomputes this server-side from scratch, and
 * webhook.php independently validates against it too, per the audit).
 */
export function calculateOrderTotal(
  subtotal: number,
  deliveryFee: number,
  discountAmount: number,
  processingFee: number
): { processingFee: number; total: number } {
  const total = Math.max(1, Math.round(subtotal + processingFee + deliveryFee - discountAmount));
  return { processingFee, total };
}