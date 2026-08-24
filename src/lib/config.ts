/**
 * Central config. Every value that points at the PHP backend lives here so
 * there's exactly one place to change when the API domain or a route name
 * changes.
 *
 * NEXT_PUBLIC_API_BASE_URL must point at the existing StockedUp backend,
 * e.g. https://stockedup.africa/backend/api — the same backend the Android
 * app already talks to. Set this in .env.local for development and in your
 * hosting provider's env config for production.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://stockedup.africa/backend/api";

export const SITE_NAME = "StockedUp Africa";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stockedup.africa";
export const DEFAULT_CITY = "Awka";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
