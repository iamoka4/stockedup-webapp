"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getVendorAnalytics,
  type AnalyticsPeriod,
  type VendorAnalytics,
} from "@/lib/api/vendor";
import { VendorIcon, type VendorIconName } from "@/components/vendor/icons";

const PERIOD_OPTIONS: { key: AnalyticsPeriod; label: string }[] = [
  { key: "1", label: "Today" },
  { key: "7", label: "This Week" },
  { key: "30", label: "This Month" },
  { key: "all", label: "All Time" },
];

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

function compactNaira(n: number) {
  if (n > 999) return `₦${(n / 1000).toFixed(0)}k`;
  return n > 0 ? `₦${n}` : "";
}

export default function AnalyticsReportPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30");
  const [data, setData] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: AnalyticsPeriod) => {
    setLoading(true);
    setError(null);
    try {
      setData(await getVendorAnalytics(p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const totalOrders = data?.total_orders ?? 0;
  const monthly = data?.monthlyData ?? [];
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);
  // The API returns all 12 months (Jan–Dec), so highlight the current month;
  // for any other length fall back to the last bar.
  const highlightIdx = monthly.length === 12 ? new Date().getMonth() : monthly.length - 1;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-bg">
      {/* Header */}
      <div className="bg-brand px-5 pb-6 pt-10 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"
          >
            <VendorIcon name="chevron" className="size-4 rotate-180" />
            Back
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold">Analytics & Reports</h1>
              <p className="mt-1 text-sm text-white/80">Real-time business insights</p>
            </div>
            <button
              type="button"
              onClick={() => load(period)}
              disabled={loading}
              className="rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10">
        {/* Period selector */}
        <div
          role="tablist"
          aria-label="Report period"
          className="my-4 flex rounded-xl bg-white dark:bg-bg-raised p-1 shadow-sm"
        >
          {PERIOD_OPTIONS.map(({ key, label }) => {
            const active = period === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(key)}
                className={`flex-1 rounded-[10px] py-2.5 text-xs transition sm:text-sm ${
                  active ? "bg-brand font-bold text-white" : "font-medium text-gray-500 dark:text-ink-soft hover:text-gray-800 dark:hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error && !data ? (
          <div className="rounded-2xl bg-white dark:bg-bg-raised p-8 text-center shadow-sm">
            <p className="text-sm text-red-500 dark:text-clay">{error}</p>
            <button
              type="button"
              onClick={() => load(period)}
              className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : loading && !data ? (
          <AnalyticsSkeleton />
        ) : (
          <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Total Revenue"
                value={naira(data?.totalRevenue ?? 0)}
                icon="wallet"
                color="#34C759"
                note={`${data?.paid_orders ?? 0} paid orders`}
              />
              <MetricCard
                title="Total Orders"
                value={String(totalOrders)}
                icon="clipboard"
                color="#007AFF"
                note={`${data?.paid_orders ?? 0} paid`}
              />
              <MetricCard
                title="Avg Order Value"
                value={naira(Number(data?.average_order_value ?? 0))}
                icon="chart"
                color="#5856D6"
                note="per order"
              />
              <MetricCard
                title="Acceptance Rate"
                value={`${Math.round(Number(data?.acceptance_rate ?? 0))}%`}
                icon="star"
                color="#FF9500"
                note="of orders"
              />
            </div>

            {/* Monthly revenue */}
            <section className="mt-4 rounded-2xl bg-white dark:bg-bg-raised p-5 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-gray-800 dark:text-ink">Monthly Revenue</h2>
              {monthly.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 dark:text-ink-soft">No revenue data yet.</p>
              ) : (
                <div className="flex h-40 items-end justify-between gap-1.5 sm:gap-3">
                  {monthly.map((item, i) => {
                    const h = Math.max((item.revenue / maxRevenue) * 120, 4);
                    const isLast = i === highlightIdx;
                    return (
                      <div key={`${item.month}-${i}`} className="flex flex-1 flex-col items-center justify-end">
                        <span className="mb-1 h-3 text-center text-[9px] text-gray-500 dark:text-ink-soft sm:text-[10px]">
                          {compactNaira(item.revenue)}
                        </span>
                        <div
                          className={`w-[70%] rounded ${isLast ? "bg-brand" : "bg-brand/40"}`}
                          style={{ height: h }}
                          title={`${item.month}: ${naira(item.revenue)}`}
                        />
                        <span className="mt-1 text-[10px] text-gray-400 dark:text-ink-soft">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Orders breakdown */}
            <section className="mt-4 rounded-2xl bg-white dark:bg-bg-raised p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-800 dark:text-ink">Orders Breakdown</h2>
              <div className="space-y-3.5">
                <BreakdownRow label="Pending" count={data?.pending_orders ?? 0} total={totalOrders} color="#FF9500" />
                <BreakdownRow label="Completed" count={data?.completed_orders ?? 0} total={totalOrders} color="#34C759" />
                <BreakdownRow label="Rejected" count={data?.rejected_orders ?? 0} total={totalOrders} color="#FF3B30" />
                <BreakdownRow label="Paid" count={data?.paid_orders ?? 0} total={totalOrders} color="#007AFF" />
              </div>
            </section>

            {/* Product overview */}
            <section className="mt-4 rounded-2xl bg-white dark:bg-bg-raised p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-800 dark:text-ink">Product Overview</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <ProductStat
                  icon="package"
                  value={data?.product_overview?.total_products ?? 0}
                  label="Total Products"
                  color="var(--color-brand, #16a34a)"
                />
                <ProductStat
                  icon="package"
                  value={data?.product_overview?.in_stock ?? 0}
                  label="In Stock"
                  color="#34C759"
                />
                <ProductStat
                  icon="package"
                  value={data?.product_overview?.out_of_stock ?? 0}
                  label="Out of Stock"
                  color="#FF3B30"
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  note,
}: {
  title: string;
  value: string;
  icon: VendorIconName;
  color: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border-l-4 bg-white dark:bg-bg-raised p-4 shadow-sm" style={{ borderLeftColor: color }}>
      <span
        className="mb-2.5 flex size-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <VendorIcon name={icon} className="size-5" />
      </span>
      <p className="truncate text-xl font-bold text-gray-800 dark:text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-ink-soft">{title}</p>
      <p className="mt-0.5 text-[11px] font-semibold" style={{ color }}>
        {note}
      </p>
    </div>
  );
}

function BreakdownRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex w-24 items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-gray-800 dark:text-ink">{label}</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <span className="w-8 text-right text-sm font-bold text-gray-800 dark:text-ink">{count}</span>
        <div
          className="h-1.5 max-w-[100px] flex-1 rounded-full bg-gray-100 dark:bg-bg-elevated"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} orders`}
        >
          <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
        </div>
        <span className="w-9 text-right text-xs text-gray-500 dark:text-ink-soft">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

function ProductStat({
  icon,
  value,
  label,
  color,
}: {
  icon: VendorIconName;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span style={{ color }}>
        <VendorIcon name={icon} className="size-8" />
      </span>
      <span className="text-3xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-gray-500 dark:text-ink-soft">{label}</span>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading analytics">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-white dark:bg-bg-raised" />
        ))}
      </div>
      <div className="mt-4 h-56 rounded-2xl bg-white dark:bg-bg-raised" />
      <div className="mt-4 h-48 rounded-2xl bg-white dark:bg-bg-raised" />
    </div>
  );
}