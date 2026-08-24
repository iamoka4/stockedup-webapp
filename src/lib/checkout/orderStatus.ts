export type StampTone = "brand" | "leaf" | "indigo" | "clay" | "ink";

/**
 * get-orders.php lowercases and title-cases o.status, mapping 'completed'
 * to the display label 'Delivered'. Other values seen referenced elsewhere
 * in the backend (accept-order.php, reject-order.php, cancel-order.php,
 * OrderController.php) suggest: Pending, Accepted, Rejected, Cancelled,
 * Delivered. Unrecognized values fall back to a neutral tone rather than
 * guessing, since the canonical status enum wasn't part of the audit.
 */
export function statusTone(status: string): StampTone {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "completed") return "leaf";
  if (s === "pending") return "brand";
  if (s === "accepted" || s === "confirmed" || s === "scheduled") return "indigo";
  if (s === "rejected" || s === "cancelled" || s === "canceled" || s === "failed") return "clay";
  return "ink";
}
