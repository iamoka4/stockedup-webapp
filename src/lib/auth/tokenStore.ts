/**
 * tokenStore.ts
 *
 * v1 storage strategy: access + refresh tokens in localStorage. This is the
 * fast path to get the web app working end-to-end against the existing
 * JSON-body token responses with zero backend changes.
 *
 * KNOWN TRADE-OFF: localStorage is readable by any script on the page, so
 * it's more exposed to XSS than an httpOnly cookie. Recommended upgrade
 * path once the backend adds cookie-setting to login.php / vendor-login.php
 * / refresh-token.php: keep the access token in memory only (module-level
 * variable, cleared on tab close) and move the refresh token into an
 * httpOnly cookie the browser sends automatically. Every other file in the
 * app calls the functions below, not localStorage directly — so that
 * migration is contained to this one file.
 */

const ACCESS_KEY = "stockedup_access_token";
const REFRESH_KEY = "stockedup_refresh_token";
const ROLE_KEY = "stockedup_role";

export type Role = "buyer" | "vendor";

export const tokenStore = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  getRole(): Role | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ROLE_KEY) as Role | null;
  },
  set(accessToken: string, refreshToken: string, role: Role): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
    window.localStorage.setItem(ROLE_KEY, role);
  },
  setAccessToken(accessToken: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(ROLE_KEY);
  },
  isLoggedIn(): boolean {
    return !!tokenStore.getAccessToken();
  },
};
