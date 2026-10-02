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