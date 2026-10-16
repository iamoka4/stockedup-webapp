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

/**
 * quantity = 0 removes the item (backend contract; max 25).
 *
 * `cart_id` is the cart ROW's own id (CartItem.id), NOT the product id.
 * The same product can have several rows with different add-ons, so
 * product_id alone can't identify a single line. The backend also rescales
 * that row's add-on quantities/prices whenever the quantity changes.
 */
export async function updateCartItem(
  cart_id: number,
  quantity: number
): Promise<void> {
  await ensureGuestToken();
  await apiRequest("/update-cart.php", {
    method: "POST",
    withIdentity: true,
    body: { cart_id, quantity },
  });
}

export function removeCartItem(cart_id: number): Promise<void> {
  return updateCartItem(cart_id, 0);
}

// ── "Forgot something?" suggestions ─────────────────────────────────────────
// The server reads the cart (user or guest) and decides what to suggest, so
// nothing but the identity is sent. Prices already include promotions.
export interface CartSuggestion {
  id: number;
  vendor_id: number;
  name: string;
  price: number;
  original_price: number | null;
  unit: string;
  image: string;
  /** true when the product has required add-ons: send the customer to its page. */
  needs_options: boolean;
}

export async function getCartSuggestions(): Promise<{
  suggestions: CartSuggestion[];
}> {
  await ensureGuestToken();
  return apiRequest("/get-cart-suggestions.php", {
    method: "GET",
    withIdentity: true,
  });
}