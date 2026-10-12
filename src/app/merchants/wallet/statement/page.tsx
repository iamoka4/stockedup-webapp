"use client";

import { useCallback, useEffect, useState } from "react";
import { getSettlementReports, type Pagination, type SettlementReport } from "@/lib/api/vendor-wallet";
import { errorMessage } from "@/components/vendor/ui";
import { BackHeader, WalletIcon, formatAmount } from "@/components/vendor/wallet-ui";

const formatDay = (value: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className={`text-[13px] ${strong ? "font-bold text-gray-800" : "font-medium text-gray-400"}`}>
        {label}
      </span>
      <span className={`text-right text-[13px] ${strong ? "text-[15px] font-extrabold text-gray-900" : "font-bold text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

export default function SettlementReportsPage() {
  const [reports, setReports] = useState<SettlementReport[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getSettlementReports(1);
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const next = await getSettlementReports(pagination.page + 1);
      setReports((prev) => [...prev, ...next.reports]);
      setPagination(next.pagination);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <BackHeader title="Settlement Reports" backHref="/merchants/wallet/settings" />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-5">
        {loading ? (
          <p className="py-14 text-center text-sm text-gray-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <WalletIcon name="file-text" className="size-11 text-gray-300" />
            <p className="text-base font-bold text-gray-800">No settlement reports yet</p>
            <p className="max-w-xs text-[13px] text-gray-400">
              Your payout settlement reports will appear here once they&apos;re generated
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Period</p>
                      <p className="mt-0.5 text-sm font-extrabold text-gray-900">
                        {formatDay(r.period_start)} – {formatDay(r.period_end)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                        r.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <Row label="Gross Sales" value={formatAmount(r.gross_sales)} />
                  <Row label="Platform Fee" value={`-${formatAmount(r.platform_fee)}`} />
                  <Row label="Net Payout" value={formatAmount(r.net_payout)} strong />

                  <div className="flex items-center justify-between gap-3 pt-1 text-xs text-gray-400">
                    <span>
                      {r.order_count} order{r.order_count !== 1 ? "s" : ""}
                    </span>
                    {r.sent_at && <span>Sent {formatDay(r.sent_at)}</span>}
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.page < pagination.total_pages && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-2 w-full py-3.5 text-sm font-bold text-brand-deep disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}