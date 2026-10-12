import { apiRequest } from "./client";

/**
 * ⚠ SET THIS to the endpoint the mobile app's useGetVendorProducts hook calls.
 * Open base/api/vendors/products/useGetVendorProducts.ts in the app and copy
 * the string inside its apiClient.get("...") call, keeping the leading "/".
 * The mobile screen reads `data.products`, and this code accepts either
 * { products: [...] } or a plain array.
 */
export const VENDOR_PRODUCTS_PATH = "/get-vendor-products.php";

export interface VendorProduct {
  id: string | number;
  name: string;
  price: number;
  stock: string | number | null;
  category: string;
  image: string | null;
}

interface RawProduct {
  id?: string | number;
  name?: string;
  price?: string | number;
  stock?: string | number | null;
  category?: string | null;
  category_name?: string | null;
  image?: string | null;
  image_url?: string | null;
}

export async function getVendorProducts(): Promise<VendorProduct[]> {
  const data = await apiRequest<{ products?: RawProduct[] } | RawProduct[]>(
    VENDOR_PRODUCTS_PATH
  );
  const list = Array.isArray(data) ? data : data?.products ?? [];
  return list.map((p, i) => ({
    id: p.id ?? i,
    name: p.name ?? "Unnamed product",
    price: Number(p.price) || 0,
    stock: p.stock ?? null,
    category: p.category ?? p.category_name ?? "",
    image: p.image ?? p.image_url ?? null,
  }));
}

/** Absolute URLs pass through; relative paths resolve against the site root,
 *  the same rule the mobile orders screen uses. */
export function productImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `https://stockedup.africa/${path.replace(/^\/+/, "")}`;
}

export interface StockInfo {
  label: string;
  color: string;
}

/**
 * Same colours as the mobile badge. Two small differences:
 * - the string "outOfStock" (used by the backend) counts as out of stock;
 * - 1–9 units show as "Low Stock". On mobile, 1–4 units fall through to
 *   "Stock Unknown", which looks like an oversight.
 */
export function stockInfo(stock: string | number | null): StockInfo {
  if (typeof stock === "string" && stock.trim().toLowerCase() === "outofstock") {
    return { label: "Out of Stock", color: "#FF3B30" };
  }
  if (stock === null || stock === undefined || stock === "") {
    return { label: "Stock Unknown", color: "#999999" };
  }
  const n = Number(stock);
  if (Number.isNaN(n)) return { label: "Stock Unknown", color: "#999999" };
  if (n <= 0) return { label: "Out of Stock", color: "#FF3B30" };
  if (n >= 10) return { label: "In Stock", color: "#34C759" };
  return { label: "Low Stock", color: "#FF9500" };
}