import { apiRequest, refreshAccessToken } from "./client";
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
 * Vendor login. Authenticates against vendor-login.php and stores a vendor
 * session (role "vendor"). After a successful login, callers should read the
 * vendor's onboarding state and send them to /vendor/dashboard, or to the
 * next incomplete onboarding step.
 *
 * The token store holds one session at a time, so logging in as a vendor
 * replaces any buyer session in this browser (and vice versa). Someone who is
 * both a customer and a vendor logs in again to switch.
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

interface VendorRegisterResponse {
  token: string;
  refresh_token: string;
  vendor: AuthUser;
}

/**
 * Creates a vendor account via vendor-register.php and logs the vendor in
 * (the endpoint returns a token pair). Flow:
 *   sendOtp(email, "signup", "vendor") -> verifyOtp(...) -> vendorRegister(...)
 * Only call this after verifyOtp has succeeded: the server independently
 * checks for a verified signup OTP for this email within the last 30 minutes.
 */
export async function vendorRegister(input: {
  businessType: "grocery" | "restaurant" | "supermarket";
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: true;
}): Promise<AuthUser> {
  const data = await apiRequest<VendorRegisterResponse>("/vendor-register.php", {
    method: "POST",
    skipAuth: true,
    body: { ...input, otp_verified: true },
  });
  tokenStore.set(data.token, data.refresh_token, "vendor");
  return data.vendor;
}

/**
 * referralCode: a friend's code typed by the customer (customer-to-customer).
 * vendorRef:    the code carried silently from a vendor's referral link/QR.
 * A customer is referred by one or the other, never both; register.php
 * enforces that, and the register forms only send the one that applies.
 */
export async function register(input: {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  otp_verified: boolean;
  referralCode?: string;
  vendorRef?: string;
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
  // Capture the refresh token first, clear the local session immediately so
  // the UI responds at once, then tell the server to delete this device's
  // refresh token in the background. A network failure is ignored: the local
  // session is already gone.
  const refresh_token = tokenStore.getRefreshToken();
  tokenStore.clear();
  if (refresh_token) {
    apiRequest("/logout.php", {
      method: "POST",
      skipAuth: true,
      body: { refresh_token },
    }).catch(() => {});
  }
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

/**
 * Delegates to the shared, de-duplicated refresh in client.ts. Refresh tokens
 * rotate (the old one is revoked on use), so two overlapping refresh calls
 * would make the second fail and log the user out. Everything must go
 * through the single in-flight refresh.
 */
export async function refreshSession(): Promise<boolean> {
  return refreshAccessToken();
}