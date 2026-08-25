import { apiRequest } from "./client";

export interface ApplyVoucherResult {
  discount_amount: number;
}

export function applyVoucher(
  voucherCode: string,
  orderSubtotal: number
): Promise<ApplyVoucherResult> {
  return apiRequest<ApplyVoucherResult>("/apply-voucher.php", {
    method: "POST",
    body: { voucher_code: voucherCode, order_subtotal: orderSubtotal },
  });
}