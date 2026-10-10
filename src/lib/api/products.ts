import { apiGet } from "./client";
import type { Product, ProductDetailResponse } from "./types";

export type BusinessType =
  | "grocery"
  | "restaurant"
  | "supermarket"
  | "pharmacy"
  | "beauty";

export interface ProductFilters {
  category?: string;
  vendor_id?: number;
  city?: string;
  /** Limit to products sold by vendors of these business types. */
  business_type?: BusinessType | BusinessType[];
  /** Free-text marketplace search (see searchProducts). */
  q?: string;
}

export function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const { business_type } = filters;
  return apiGet("/get-products.php", {
    category: filters.category,
    vendor_id: filters.vendor_id,
    city: filters.city,
    business_type: Array.isArray(business_type)
      ? business_type.join(",")
      : business_type,
    q: filters.q,
  });
}

/** Cooked meals from restaurants only. */
export function getFoodProducts(
  filters: Omit<ProductFilters, "business_type"> = {}
): Promise<Product[]> {
  return getProducts({ ...filters, business_type: "restaurant" });
}

/** Groceries from local vendors/shops and supermarkets. */
export function getGroceryProducts(
  filters: Omit<ProductFilters, "business_type"> = {}
): Promise<Product[]> {
  return getProducts({ ...filters, business_type: ["grocery", "supermarket"] });
}

/** Supermarket items only. */
export function getSupermarketProducts(
  filters: Omit<ProductFilters, "business_type"> = {}
): Promise<Product[]> {
  return getProducts({ ...filters, business_type: "supermarket" });
}

// ─── Marketplace search ──────────────────────────────────────────────────────
// get-products.php?q=… searches restaurant meals, groceries and supermarket
// items together. The server matches name, description, category and vendor
// name, ranks by relevance (in-stock first), applies the city filter and
// hides deleted vendors. Same endpoint and rules the mobile app uses.

/** A product as returned by a search: Product plus the search-only fields. */
export type SearchProduct = Product & {
  vendor_name?: string | null;
  business_type?: BusinessType | null;
  sold_out?: boolean;
};

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;

export function searchProducts(
  query: string,
  city?: string
): Promise<SearchProduct[]> {
  const q = query.trim().slice(0, MAX_SEARCH_LENGTH);
  if (q.length < MIN_SEARCH_LENGTH) return Promise.resolve([]);
  return getProducts({ q, city }) as Promise<SearchProduct[]>;
}

export interface BestSellersFilters {
  city?: string;
}

export function getBestSellers(filters: BestSellersFilters = {}): Promise<Product[]> {
  return apiGet("/get-best-sellers.php", {
    period: "weekly",
    filter: "weekly",
    type: "weekly",
    range: "weekly",
    timeframe: "weekly",
    interval: "7",
    city: filters.city,
  });
}

export function getProduct(id: number): Promise<ProductDetailResponse> {
  return apiGet("/get-product.php", { id });
}