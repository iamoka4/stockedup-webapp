import { API_BASE_URL } from "@/lib/config";
import { guestToken } from "@/lib/guestToken";
import { tokenStore } from "@/lib/auth/tokenStore";

/**
 * Ensures a guest token exists before a guest cart action. Logged-in users
 * never need this — call sites should check tokenStore.isLoggedIn() first.
 * Safe to call repeatedly; it's a no-op once a token is cached.
 */
export async function ensureGuestToken(): Promise<string | null> {
  if (tokenStore.isLoggedIn()) return null;

  const existing = guestToken.get();
  if (existing) return existing;

  try {
    const res = await fetch(`${API_BASE_URL}/guest-session.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (json.status === "success" && json.data?.guest_token) {
      guestToken.set(json.data.guest_token);
      return json.data.guest_token;
    }
  } catch {
    // Non-fatal — cart calls will just fail with "login or guest session
    // required" and the UI can prompt the user to try again.
  }
  return null;
}
