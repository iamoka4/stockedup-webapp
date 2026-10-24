import { apiRequest } from "./client";
import type { CheckoutItem } from "./payments";

/**
 * What the backend says this checkout costs (POST /checkout-quote.php).
 * The page displays this and never works the numbers out itself, so the
 * screen, the amount charged and the order the backend creates agree.
 */
export interface CheckoutQuote {
  items_subtotal: number;
  processing_fee: number;
  delivery: { standard_fee: number; discount: number; charge: number };
  voucher_discount: number;
  voucher_error: string | null;
  promotion: {
    status: "none" | "applied" | "below_minimum";
    title?: string;
    description?: string;
    message?: string;
    shortfall?: number;
  };
  total: number;
}

const toNum = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);

export async function getCheckoutQuote(params: {
  items: CheckoutItem[];
  latitude: number;
  longitude: number;
  quoteId: string | null;
  voucherCode?: string | null;
}): Promise<CheckoutQuote> {
  const res = (await apiRequest("/checkout-quote.php", {
    method: "POST",
    body: {
      items: params.items,
      customer_latitude: params.latitude,
      customer_longitude: params.longitude,
      quote_id: params.quoteId,
      voucher_code: params.voucherCode ?? null,
    },
  })) as any;

  // apiRequest hands back the response's data part; tolerate either shape.
  const raw = res?.data ?? res;

  return {
    items_subtotal: toNum(raw?.items_subtotal),
    processing_fee: toNum(raw?.processing_fee),
    delivery: {
      standard_fee: toNum(raw?.delivery?.standard_fee),
      discount: toNum(raw?.delivery?.discount),
      charge: toNum(raw?.delivery?.charge),
    },
    voucher_discount: toNum(raw?.voucher_discount),
    voucher_error: raw?.voucher_error ?? null,
    promotion: {
      status: raw?.promotion?.status ?? "none",
      title: raw?.promotion?.title,
      description: raw?.promotion?.description,
      message: raw?.promotion?.message,
      shortfall: toNum(raw?.promotion?.shortfall),
    },
    total: toNum(raw?.total),
  };
}