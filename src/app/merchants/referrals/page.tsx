"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  generateReferral,
  getReferralAnalytics,
  type ReferralAnalytics,
  type ReferralInfo,
} from "@/lib/api/vendor";
import { VendorIcon } from "@/components/vendor/icons";

type ShareSource = "whatsapp" | "facebook" | "x" | "instagram";

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  direct: "Direct link",
};

const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

export default function ReferralAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setAnalyticsError(null);
    setReferralError(null);
    // Independent requests: a failure in one shouldn't hide the other.
    const [a, r] = await Promise.allSettled([getReferralAnalytics(), generateReferral()]);
    if (a.status === "fulfilled") setAnalytics(a.value);
    else setAnalyticsError(errMsg(a.reason, "Couldn't load your referral analytics"));
    if (r.status === "fulfilled") setReferral(r.value);
    else setReferralError(errMsg(r.reason, "Couldn't load your referral link"));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const linkWithSource = (source: string) =>
    referral ? `${referral.referral_link}${referral.referral_link.includes("?") ? "&" : "?"}src=${source}` : "";

  async function copyLink() {
    if (!referral) return;
    try {
      await navigator.clipboard.writeText(linkWithSource("direct"));
      setToast("Referral link copied");
    } catch {
      setToast("Couldn't copy. Select the link and copy it manually.");
    }
  }

  async function shareVia(source: ShareSource) {
    if (!referral) return;
    const url = linkWithSource(source);
    const message = `Order from my shop on StockedUp: ${url}`;
    const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

    switch (source) {
      case "whatsapp":
        return open(`https://wa.me/?text=${encodeURIComponent(message)}`);
      case "x":
        return open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
      case "facebook":
        return open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
      case "instagram": {
        // Instagram has no web share URL: use the native share sheet, else copy.
        if (typeof navigator.share === "function") {
          try {
            await navigator.share({ text: message });
          } catch {
            /* dismissed */
          }
        } else {
          await navigator.clipboard.writeText(url).catch(() => {});
          setToast("Link copied. Paste it into Instagram.");
        }
      }
    }
  }

  const funnel = analytics?.funnel;
  const rates = analytics?.conversion_rates;
  const bySource = analytics?.by_source ?? [];
  const bothFailed = !loading && !analytics && !referral;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 pb-5 pt-10">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            <VendorIcon name="chevron" className="size-4 rotate-180" />
            Back
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold">Referral Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Your referral performance</p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-xl border border-line px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-5">
        {loading && !analytics && !referral ? (
          <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading referral data">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-white" />
              ))}
            </div>
          </div>
        ) : bothFailed ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-500">{analyticsError ?? referralError}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Referral link + QR */}
            <section className="rounded-2xl border border-line bg-white p-5">
              {referral ? (
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referral.qr_code_url}
                    alt="Your shop referral QR code"
                    className="size-44 object-contain"
                  />
                  <p className="mt-3 max-w-full truncate text-sm text-gray-600" title={referral.referral_link}>
                    {referral.referral_link}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Customers who scan or tap your link land on your shop.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {(["whatsapp", "facebook", "instagram", "x"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => shareVia(s)}
                        className="rounded-full bg-brand/10 px-4 py-2 text-[13px] font-semibold text-brand transition hover:bg-brand/20"
                      >
                        {SOURCE_LABELS[s]}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={copyLink}
                      className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-red-500">{referralError ?? "Couldn't load your referral link"}</p>
                  <button type="button" onClick={load} className="mt-3 text-sm font-semibold text-brand">
                    Try again
                  </button>
                </div>
              )}
            </section>

            {/* Funnel */}
            {funnel ? (
              <>
                <h2 className="mb-3 ml-1 mt-7 text-base font-bold text-gray-800">Funnel</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatCard label="QR Scans" value={funnel.total_qr_scans} />
                  <StatCard label="Link Clicks" value={funnel.total_referral_link_clicks} />
                  <StatCard label="New Customers" value={funnel.new_customers_acquired} />
                  <StatCard label="First Orders" value={funnel.first_orders} />
                  <StatCard label="Repeat Orders" value={funnel.repeat_orders} />
                  <StatCard label="Revenue" value={`₦${Number(funnel.total_revenue ?? 0).toLocaleString()}`} />
                </div>
              </>
            ) : (
              analyticsError && <InlineError message={analyticsError} onRetry={load} />
            )}

            {/* Conversion rates */}
            {rates && (
              <>
                <h2 className="mb-3 ml-1 mt-7 text-base font-bold text-gray-800">Conversion Rates</h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Scan/Click → Signup" value={`${rates.scan_or_click_to_signup_pct}%`} />
                  <StatCard label="Signup → First Order" value={`${rates.signup_to_first_order_pct}%`} />
                </div>
              </>
            )}

            {/* By source */}
            {bySource.length > 0 && (
              <>
                <h2 className="mb-3 ml-1 mt-7 text-base font-bold text-gray-800">Where visits come from</h2>
                <div className="divide-y divide-gray-100 rounded-2xl border border-line bg-white">
                  {bySource.map((row, i) => (
                    <div key={`${row.source}-${row.event_type}-${i}`} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {SOURCE_LABELS[row.source] ?? row.source}
                        </p>
                        <p className="text-xs text-gray-500">
                          {row.event_type === "qr_scan" ? "QR scans" : "Link clicks"}
                        </p>
                      </div>
                      <span className="text-base font-bold text-brand">{row.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-brand/10 p-4">
      <p className="truncate text-[22px] font-bold text-brand">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-7 rounded-2xl bg-white p-6 text-center">
      <p className="text-sm text-red-500">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold text-brand">
        Retry
      </button>
    </div>
  );
}