import { apiGet } from "./client";
import type { Category } from "./types";

export function getCategories(): Promise<{ categories: Category[] }> {
  return apiGet("/get-categories.php");
}
