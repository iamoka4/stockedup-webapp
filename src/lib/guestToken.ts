/**
 * guestToken.ts
 *
 * Web counterpart to the mobile app's guestToken.ts. Manages the guest
 * session token issued by POST /guest-session.php, stored in localStorage
 * so it survives reloads within the same browser. Sent as the
 * `X-Guest-Token` header on cart calls when the visitor isn't logged in.
 *
 * Distinct from auth tokens — this identifies an anonymous cart, nothing
 * else. It's cleared once the guest logs in or registers (the backend
 * merges the guest cart into their account at that point).
 */

const STORAGE_KEY = "stockedup_guest_token";

export const guestToken = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  },

  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, token);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
