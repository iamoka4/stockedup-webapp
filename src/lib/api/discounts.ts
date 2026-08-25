import { apiGet } from "./client";

export interface FirstOrderDiscount {
  eligible: boolean;
  discount_amount: number;
  minimum_subtotal: number;
  reason: string;
}

export function checkFirstOrderDiscount(): Promise<FirstOrderDiscount> {
  return apiGet("/check-first-order-discount.php");
}