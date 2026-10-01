import { apiRequest } from "./client";
import { ensureGuestToken } from "./guestSession";
import type { CartItem, SelectedAddon } from "./types";

export async function getCart(): Promise<{ items: CartItem[] }> {
  await ensureGuestToken();
  return apiRequest("/get-cart.php", { method: "GET", withIdentity: true });
}

export interface AddToCartOptions {
  addons?: SelectedAddon[];
  special_request?: string;
}

export async function addToCart(
  product_id: number,
  quantity = 1,
  options: AddToCartOptions = {}
): Promise<{ cart_count: number }> {
  await ensureGuestToken();

  const body: Record<string, unknown> = { product_id, quantity };
  if (options.addons && options.addons.length > 0) body.addons = options.addons;
  if (options.special_request) body.special_request = options.special_request;

  return apiRequest("/add-to-cart.php", {
    method: "POST",
    withIdentity: true,
    body,
  });
}

/** quantity = 0 removes the item, matching the backend contract. */
export async function updateCartItem(
  product_id: number,
  quantity: number
): Promise<void> {
  await ensureGuestToken();
  await apiRequest("/update-cart.php", {
    method: "POST",
    withIdentity: true,
    body: { product_id, quantity },
  });
}

export function removeCartItem(product_id: number): Promise<void> {
  return updateCartItem(product_id, 0);
}