import { API_BASE_URL } from "@/lib/config";
import { tokenStore } from "@/lib/auth/tokenStore";
import { guestToken } from "@/lib/guestToken";
import type { ApiEnvelope } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** Extra request headers (e.g. Idempotency-Key). Applied last, so they win over the defaults. */
  headers?: Record<string, string>;
  /** Attach Authorization if logged in, else X-Guest-Token. Used by cart endpoints. */
  withIdentity?: boolean;
  /** Attach Authorization only; 401s are not retried via refresh (login/register themselves). */
  skipAuth?: boolean;
  /** Internal — prevents infinite refresh loops. */
  _isRetry?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Refreshes the access token using the stored refresh token. Concurrent
 * callers share one in-flight request: refresh tokens rotate, so a second
 * parallel refresh with the same token would be rejected as revoked.
 * Exported so auth.ts's refreshSession() uses this same path.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refresh_token = tokenStore.getRefreshToken();
  if (!refresh_token) return false;

  // De-dupe concurrent 401s so we don't fire N refresh calls at once.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
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
        tokenStore.clear();
        return false;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Parses the PHP envelope and returns `data`, or throws ApiError. */
async function unwrap<T>(res: Response): Promise<T> {
  let json: ApiEnvelope<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Unexpected server response", res.status);
  }

  // Most endpoints send status as the string "success"/"error", but at
  // least one (get-vendor-details.php) sends the raw PHP boolean true/false
  // instead. Accept both rather than assuming a single convention holds
  // across every file on the backend.
  const isSuccess = json.status === "success" || (json.status as unknown) === true;
  if (!isSuccess) {
    throw new ApiError(json.message || "Request failed", res.status);
  }

  return json.data as T;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers: extraHeaders, withIdentity, skipAuth, _isRetry } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const accessToken = tokenStore.getAccessToken();
  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else if (withIdentity && !accessToken) {
    const gt = guestToken.get();
    if (gt) headers["X-Guest-Token"] = gt;
  }

  if (extraHeaders) Object.assign(headers, extraHeaders);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  // Access token expired mid-session — refresh once and retry.
  if (res.status === 401 && accessToken && !_isRetry && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...opts, _isRetry: true });
    }
    tokenStore.clear();
  }

  return unwrap<T>(res);
}

/**
 * multipart/form-data POST (profile images, product images, documents).
 * Deliberately sets NO Content-Type header: the browser must add it itself
 * with the multipart boundary. Same refresh-and-retry behaviour as apiRequest.
 */
export async function apiUpload<T>(
  path: string,
  form: FormData,
  _isRetry = false
): Promise<T> {
  const accessToken = tokenStore.getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: form,
    cache: "no-store",
  });

  if (res.status === 401 && accessToken && !_isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiUpload<T>(path, form, true);
    }
    tokenStore.clear();
  }

  return unwrap<T>(res);
}

/** GET with query params appended, for public/SSR-safe calls (no auth needed). */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  return apiRequest<T>(`${path}${qs}`, { method: "GET" });
}