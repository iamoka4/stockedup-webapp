import { apiGet } from "./client";

export type PromoPopupItem = {
  id: number;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  cta_text?: string | null;
  cta_target: "restaurants" | "groceries" | "supermarkets" | "none";
  image?: string | null;
};

export async function getPromoPopups(): Promise<PromoPopupItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await apiGet("/get-promo-popups.php");
  // apiGet may already unwrap the { status, data } envelope.
  if (Array.isArray(res)) return res as PromoPopupItem[];
  const list = res?.data ?? res?.promos ?? [];
  return Array.isArray(list) ? (list as PromoPopupItem[]) : [];
}