import { redirect } from "next/navigation";

interface Props {
  params: { code: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * /r/[code] — Vendor referral link handler.
 *
 * The actual deep-link logic (QR scan tracking, app-open attempt,
 * Play Store fallback) lives in r.php on the cPanel backend.
 * This Next.js route exists purely to catch requests that Vercel
 * intercepts before they reach cPanel, and immediately forwards
 * them to the PHP handler with all original query params preserved.
 */
export default function ReferralRedirect({ params, searchParams }: Props) {
  const { code } = params;

  // Rebuild query string from all original params
  const qs = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else if (value !== undefined) {
      qs.set(key, value);
    }
  });

  const queryString = qs.toString();
  const target = `https://stockedup.africa/r.php?code=${encodeURIComponent(code)}${queryString ? `&${queryString}` : ""}`;

  redirect(target);
}