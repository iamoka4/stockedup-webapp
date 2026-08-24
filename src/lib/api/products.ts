import { apiGet } from "./client";
import type { Product, ProductDetailResponse } from "./types";

export interface ProductFilters {
  category?: string;
  vendor_id?: number;
  city?: string;
}

export function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  return apiGet("/get-products.php", {
    category: filters.category,
    vendor_id: filters.vendor_id,
    city: filters.city,
  });
}

export function getProduct(id: number): Promise<ProductDetailResponse> {
  return apiGet("/get-product.php", { id });
}
