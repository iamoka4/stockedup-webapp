import { apiRequest } from "./client";
import { ensureGuestToken } from "./guestSession";
import type { CartItem } from "./types";

export async function getCart(): Promise<{ items: CartItem[] }> {
  await ensureGuestToken();
  return apiRequest("/get-cart.php", { method: "GET", withIdentity: true });
}

export async function addToCart(
  product_id: number,
  quantity = 1
): Promise<{ cart_count: number }> {
  await ensureGuestToken();
  return apiRequest("/add-to-cart.php", {
    method: "POST",
    withIdentity: true,
    body: { product_id, quantity },
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
