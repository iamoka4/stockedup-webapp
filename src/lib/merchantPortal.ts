// Public merchant pages that keep the normal site header/footer.
const MERCHANT_PUBLIC_PATHS = [
  "/merchants/login",
  "/merchants/register",
  "/merchants/forgot-password",
];

/**
 * True for logged-in merchant pages (dashboard, orders, menu, onboarding, ...).
 * The /merchants landing page itself and the merchant auth pages are NOT portal pages.
 */
export function isMerchantPortalPath(pathname: string | null): boolean {
  if (!pathname || !pathname.startsWith("/merchants/")) return false;
  return !MERCHANT_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}