import { apiRequest } from "./client";
import { API_BASE_URL } from "@/lib/config";
import { tokenStore } from "@/lib/auth/tokenStore";
import { guestToken } from "@/lib/guestToken";
import type { AuthUser } from "./types";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

interface RegisterResponse {
  user_id: number;
  referral_code: string;
  acquired_by_vendor_id: number | null;
}

/**
 * Sends the guest_token (if one exists) so the backend can merge the
 * anonymous cart into the account per login.php / register.php's
 * mergeGuestCart logic, then clears it locally once merged.
 */
function withGuestToken(body: Record<string, unknown>) {
  const gt = guestToken.get();
  return gt ? { ...body, guest_token: gt } : body;
}

function onAuthSuccess(user: AuthUser, accessToken: string, refreshToken: string) {
  tokenStore.set(accessToken, refreshToken, user.role === "vendor" ? "vendor" : "buyer");
  guestToken.clear();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<LoginResponse>("/login.php", {
    method: "POST",
    skipAuth: true,
    body: withGuestToken({ email, password }),
  });
  onAuthSuccess(data.user, data.access_token, data.refresh_token);
  return data.user;
}

interface VendorLoginResponse {
  token: string;
  refresh_token: string;
  vendor: AuthUser;
}

/**
 * Vendor login only — there's no vendor web dashboard yet (customer-facing
 * PWA was the phase 1 priority), so this exists purely so the login link
 * mirrored from the mobile app isn't a dead end. It authenticates for real
 * against vendor-login.php and stores a valid session; what happens after
 * login is a "coming soon" message rather than a dashboard, until that
 * work is scoped.
 */
export async function vendorLogin(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<VendorLoginResponse>("/vendor-login.php", {
    method: "POST",
    skipAuth: true,
    body: { email, password },
  });
  tokenStore.set(data.token, data.refresh_token, "vendor");
  return data.vendor;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  otp_verified: boolean;
  referralCode?: string;
}): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/register.php", {
    method: "POST",
    skipAuth: true,
    body: withGuestToken(input as unknown as Record<string, unknown>),
  });
}

export function sendOtp(
  email: string,
  purpose: "signup" | "forgot_password",
  role: "buyer" | "vendor" = "buyer",
  phone?: string
): Promise<{ expires_in: number; channels: string[] }> {
  return apiRequest("/send-otp.php", {
    method: "POST",
    skipAuth: true,
    body: { email, purpose, role, phone },
  });
}

export function verifyOtp(
  email: string,
  otp: string,
  purpose: "signup" | "forgot_password"
): Promise<{ email: string; purpose: string; reset_token?: string }> {
  return apiRequest("/verify-otp.php", {
    method: "POST",
    skipAuth: true,
    body: { email, otp, purpose },
  });
}

export function logout(): void {
  tokenStore.clear();
  // Deliberately not clearing the guest token here — logging out should let
  // the person keep browsing/shopping as a guest without losing their cart.
}

/**
 * reset-password.php contract (confirmed against the PHP):
 *   POST JSON { token, password, type: "user" | "vendor" }
 * The token is the `reset_token` returned by verify-otp.php for the
 * 'forgot_password' purpose. The server looks up the email from the token,
 * so the email is not sent. It is kept as the first argument only so the
 * existing call site doesn't change.
 */
export function resetPassword(
  _email: string,
  reset_token: string,
  new_password: string,
  type: "user" | "vendor" = "user"
): Promise<void> {
  return apiRequest("/reset-password.php", {
    method: "POST",
    skipAuth: true,
    body: { token: reset_token, password: new_password, type },
  });
}

/** Direct fetch, not apiRequest, since there's no token to attach yet. */
export async function refreshSession(): Promise<boolean> {
  const refresh_token = tokenStore.getRefreshToken();
  if (!refresh_token) return false;
  const res = await fetch(`${API_BASE_URL}/refresh-token.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  const json = await res.json();
  if (json.status === "success" && json.data?.token) {
    tokenStore.set(
      json.data.token,
      json.data.refresh_token,
      json.data.user?.role === "vendor" ? "vendor" : "buyer"
    );
    return true;
  }
  return false;
}