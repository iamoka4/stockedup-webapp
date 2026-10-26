import { apiGet } from "./client";
import type { Category } from "./types";

// businessType is optional so existing callers keep working.
export function getCategories(
  businessType?: string,
): Promise<{ categories: Category[] }> {
  const query = businessType
    ? `?business_type=${encodeURIComponent(businessType)}`
    : "";
  return apiGet(`/get-categories.php${query}`);
}