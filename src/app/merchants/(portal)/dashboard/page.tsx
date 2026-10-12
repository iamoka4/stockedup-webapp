"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { logout } from "@/lib/api/auth";
import { getOrdersMetric, getShopProfile } from "@/lib/api/vendor";
import { errorMessage } from "@/components/vendor/ui";

// ─── Types (mirrors the mobile useGetOrdersMetric response) ──────────────────

type Order = {
  order_id: number | string;
  order_uid?: string;
  customer_name?: string;
  items?: unknown[];
  status?: string;
  date?: string;
  subtotal?: number;
  order_type?: string;
  scheduled_for?: string;
};

type OrderMetric = {
  metrics?: {
    totalOrders?: number;
    pendingOrders?: number;
    declinedOrders?: number;
  };
  rating?: {
    avgRating?: number;
    totalReviews?: number;
  };
  orders?: Order[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function statusClasses(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "bg-amber-500";
    case "accepted":
      return "bg-orange-500";
    case "completed":
    case "delivered":
      return "bg-emerald-500";
    case "rejected":
      return "bg-red-500";
    case "enroute":
      return "bg-sky-500";
    default:
      return "bg-gray-400";
  }
}

// Only routes that exist should be marked ready. The rest render as "Soon".
const QUICK_ACTIONS = [
  { icon: "➕", title: "Add Product", href: "/merchants/products?openAdd=true", ready: false },
  { icon: "🧾", title: "Orders", href: "/merchants/orders", ready: false },
  { icon: "📊", title: "Analytics", href: "/merchants/analytics", ready: false },
  { icon: "👛", title: "Wallet", href: "/merchants/wallet", ready: false },
];

// ─── Small components ────────────────────────────────────────────────────────

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-raised p-5 text-center">
      <div className="text-2xl" aria-hidden>
        {icon}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </div>
  );
}

function OrderCard({ order, scheduled = false }: { order: Order; scheduled?: boolean }) {
  const count = order.items?.length ?? 0;
  return (
    <div className="rounded-2xl border border-line bg-bg-raised p-5">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <p className="font-bold">#{order.order_uid || order.order_id}</p>
          <p className="mt-0.5 truncate text-sm text-ink-soft">{order.customer_name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {count} item{count !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize text-white ${statusClasses(order.status)}`}
        >
          {order.status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={`text-xs ${scheduled ? "font-semibold text-brand-deep" : "text-ink-soft"}`}>
          {scheduled ? `Deliver at: ${order.scheduled_for}` : order.date}
        </p>
        <p className="font-bold text-brand-deep">{naira(order.subtotal ?? 0)}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MerchantDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [data, setData] = useState<OrderMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [profile, metric] = await Promise.allSettled([getShopProfile(), getOrdersMetric()]);

    if (profile.status === "fulfilled") {
      const p = profile.value as { business_name?: string; shop_name?: string; name?: string };
      setName(p.business_name ?? p.shop_name ?? p.name ?? "");
    }
    if (metric.status === "fulfilled") {
      setData(metric.value as OrderMetric);
    } else {
      setError(errorMessage(metric.reason));
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function handleLogout() {
    logout();
    router.replace("/merchants/login");
    router.refresh();
  }

  const metrics = data?.metrics;
  const rating = data?.rating;
  const recentOrders = useMemo(() => data?.orders ?? [], [data]);

  const scheduledOrders = useMemo(
    () =>
      recentOrders.filter((o) => {
        const s = o.status?.toLowerCase();
        return o.order_type === "scheduled" && (s === "pending" || s === "accepted" || s === "preparing");
      }),
    [recentOrders],
  );

  const hasSchedulingSupport = useMemo(
    () => recentOrders.some((o) => "scheduled_for" in o || "order_type" in o),
    [recentOrders],
  );

  const completed = useMemo(() => {
    const done = recentOrders.filter((o) => {
      const s = o.status?.toLowerCase();
      return s === "completed" || s === "delivered";
    });
    return {
      count: done.length,
      total: done.reduce((sum, o) => sum + (o.subtotal ?? 0), 0),
    };
  }, [recentOrders]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand px-6 py-6 text-white sm:px-8">
        <div className="min-w-0">
          <p className="text-sm text-white/80">Hello</p>
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
            {loading ? "Loading..." : name || "Merchant"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/30 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-deep transition hover:bg-white/90"
          >
            Log out
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        New shops are reviewed by our team within 24–48 hours.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Total sales */}
      <div className="mt-6 rounded-3xl bg-brand p-6 text-white sm:p-8">
        <p className="text-sm text-white/80">Total Sales</p>
        <p className="mt-2 font-display text-4xl font-extrabold">{naira(completed.total)}</p>
        <div className="mt-6 grid grid-cols-2 divide-x divide-white/30 rounded-2xl bg-white/15 py-3">
          <div className="text-center">
            <p className="text-xs text-white/70">Total Orders</p>
            <p className="mt-1 text-lg font-bold">{metrics?.totalOrders ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/70">Completed</p>
            <p className="mt-1 text-lg font-bold">{completed.count}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon="📋" value={metrics?.totalOrders ?? 0} label="Total Orders" />
        <StatCard icon="⏳" value={metrics?.pendingOrders ?? 0} label="Pending" />
        <StatCard icon="📦" value={metrics?.declinedOrders ?? 0} label="Declined" />
        <StatCard
          icon="⭐"
          value={(rating?.avgRating ?? 0).toFixed(1)}
          label={`Rating (${rating?.totalReviews ?? 0})`}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {QUICK_ACTIONS.map((a) => {
            const body = (
              <>
                <span className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-2xl">
                  {a.icon}
                </span>
                <span className="mt-3 text-sm font-semibold">{a.title}</span>
                {!a.ready && <span className="mt-1 text-xs text-ink-soft">Coming soon</span>}
              </>
            );
            const base =
              "flex flex-col items-center rounded-2xl border border-line bg-bg-raised p-5 text-center";
            return a.ready ? (
              <Link key={a.title} href={a.href} className={`${base} transition hover:border-brand`}>
                {body}
              </Link>
            ) : (
              <div key={a.title} className={`${base} opacity-70`} aria-disabled>
                {body}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold">Recent Orders</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-sm text-ink-soft">Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-line bg-bg-raised p-10 text-center md:col-span-2">
              <p className="text-3xl" aria-hidden>
                📦
              </p>
              <p className="mt-3 font-semibold">No Orders Yet</p>
              <p className="mt-1 text-sm text-ink-soft">
                You&apos;ll see your orders here when customers place them.
              </p>
            </div>
          ) : (
            recentOrders.slice(0, 5).map((o) => <OrderCard key={o.order_id} order={o} />)
          )}
        </div>
      </div>

      {/* Upcoming scheduled orders */}
      {hasSchedulingSupport && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold">Upcoming Scheduled Orders</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {scheduledOrders.length === 0 ? (
              <div className="rounded-2xl border border-line bg-bg-raised p-5 text-center text-sm text-ink-soft md:col-span-2">
                No upcoming scheduled orders
              </div>
            ) : (
              scheduledOrders
                .slice(0, 3)
                .map((o) => <OrderCard key={o.order_id} order={o} scheduled />)
            )}
          </div>
        </div>
      )}
    </section>
  );
}