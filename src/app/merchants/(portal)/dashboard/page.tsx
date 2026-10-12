"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrdersMetric, getShopProfile } from "@/lib/api/vendor";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { errorMessage } from "@/components/vendor/ui";
import { VendorIcon, type VendorIconName } from "@/components/vendor/icons";

// Flip to true once src/app/merchants/(portal)/notifications/page.tsx exists.
const NOTIFICATIONS_PAGE_READY = true;

// ─── Types (mirror the mobile useGetOrdersMetric response) ───────────────────

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

type Metrics = {
  totalOrders?: number;
  pendingOrders?: number;
  declinedOrders?: number;
};

type Rating = {
  avgRating?: number;
  totalReviews?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const naira = (n: number) => `₦${n.toLocaleString()}`;

function getStatusColor(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "#f39c12";
    case "accepted":
      return "#FF7A00";
    case "completed":
    case "delivered":
      return "#2ecc71";
    case "rejected":
      return "#e74c3c";
    case "enroute":
      return "#3498db";
    default:
      return "#999";
  }
}

// Same four actions as mobile. Only routes that exist are clickable; the rest show "Soon".
const QUICK_ACTIONS: { icon: VendorIconName; title: string; href: string; ready: boolean }[] = [
  { icon: "packagePlus", title: "Add Product", href: "/merchants/products?openAdd=true", ready: false },
  { icon: "receipt", title: "Orders", href: "/merchants/orders", ready: true },
  { icon: "barChart", title: "Analytics", href: "/merchants/analytics", ready: false },
  { icon: "wallet", title: "Wallet", href: "/merchants/wallet", ready: false },
];

// ─── Small components ────────────────────────────────────────────────────────

function StatCard({
  icon,
  color,
  value,
  label,
  fill = false,
}: {
  icon: VendorIconName;
  color: string;
  value: string | number;
  label: string;
  fill?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#e0e0e0] bg-white p-4">
      <span style={{ color }}>
        <VendorIcon name={icon} className="size-7" fill={fill} />
      </span>
      <span className="mt-2 text-2xl font-bold text-[#222]">{value}</span>
      <span className="mt-1 text-center text-xs text-[#999]">{label}</span>
    </div>
  );
}

function OrderCard({ order, scheduled = false }: { order: Order; scheduled?: boolean }) {
  const count = order.items?.length ?? 0;
  return (
    <Link
      href={scheduled ? "/merchants/orders?tab=Scheduled" : "/merchants/orders"}
      className="mb-3 block rounded-[14px] border border-[#e0e0e0] bg-white p-4"
    >
      <div className="mb-3 flex justify-between border-b border-[#f0f0f0] pb-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-base font-bold text-[#222]">#{order.order_uid || order.order_id}</p>
          <p className="mb-0.5 text-sm text-[#666]">{order.customer_name}</p>
          <p className="text-xs text-[#999]">
            {count} item{count !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className="h-fit shrink-0 self-start rounded-[20px] px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {scheduled ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <VendorIcon name="clock" className="size-3.5" />
            Deliver at: {order.scheduled_for}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-[#999]">
            <VendorIcon name="calendar" className="size-3.5" />
            {order.date}
          </span>
        )}
        {/* Subtotal (product amounts only), not total — same as mobile. */}
        <span className="text-base font-bold text-brand">{naira(order.subtotal ?? 0)}</span>
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MerchantHomePage() {
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [metrics, setMetrics] = useState<Metrics | undefined>();
  const [rating, setRating] = useState<Rating | undefined>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnread = useCallback(async () => {
    try {
      setUnreadCount(await getUnreadNotificationCount());
    } catch {
      /* the bell just shows no badge */
    }
  }, []);

  const load = useCallback(async () => {
    const [profile, metric] = await Promise.allSettled([getShopProfile(), getOrdersMetric()]);

    if (profile.status === "fulfilled") {
      const p = profile.value as { business_name?: string; shop_name?: string; name?: string };
      setName(p.business_name ?? p.shop_name ?? p.name ?? "");
      setProfileError(false);
    } else {
      setProfileError(true);
    }
    setProfileLoading(false);

    if (metric.status === "fulfilled") {
      setMetrics(metric.value.metrics);
      setRating(metric.value.rating);
      setOrders((metric.value.orders ?? []) as unknown as Order[]);
      setOrdersError(null);
    } else {
      setOrdersError(errorMessage(metric.reason));
    }
    setOrdersLoading(false);

    loadUnread();
  }, [loadUnread]);

  useEffect(() => {
    load();
  }, [load]);

  // Web equivalent of mobile's pull-to-refresh: refetch whenever the tab regains focus,
  // and keep the notification badge fresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(loadUnread, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [load, loadUnread]);

  const scheduledOrders = useMemo(
    () =>
      orders.filter((o) => {
        const s = o.status?.toLowerCase();
        return (
          o.order_type === "scheduled" && (s === "pending" || s === "accepted" || s === "preparing")
        );
      }),
    [orders],
  );

  const hasSchedulingSupport = useMemo(
    () => orders.some((o) => "scheduled_for" in o || "order_type" in o),
    [orders],
  );

  const completed = useMemo(() => {
    const done = orders.filter((o) => {
      const s = o.status?.toLowerCase();
      return s === "completed" || s === "delivered";
    });
    return { count: done.length, total: done.reduce((sum, o) => sum + (o.subtotal ?? 0), 0) };
  }, [orders]);

  const bellInner = (
    <>
      <VendorIcon name="bell" className="size-6" fill={unreadCount > 0} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[11px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </>
  );
  const bellClass =
    "relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white";

  return (
    // -mb-24 / pb-24 lets the grey page background run behind the fixed tab bar.
    <div className="-mb-24 min-h-screen bg-[#f8f9fa] pb-24">
      {/* ── Header ── */}
      <div className="rounded-b-[28px] bg-brand px-5 pb-6 pt-10">
        <div className="mx-auto flex max-w-2xl items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-sm text-white/80">Hello</p>
            <p className="truncate text-2xl font-extrabold text-white">
              {profileLoading ? "Loading..." : profileError ? "Error loading profile" : name}
            </p>
          </div>

          {NOTIFICATIONS_PAGE_READY ? (
            <Link href="/merchants/notifications" aria-label="Notifications" className={bellClass}>
              {bellInner}
            </Link>
          ) : (
            <span aria-label="Notifications" title="Notifications coming soon" className={bellClass}>
              {bellInner}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {ordersError && (
          <div
            role="alert"
            className="mx-[15px] mt-[15px] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {ordersError}
          </div>
        )}

        {/* ── Total Sales Card ── */}
        <div className="m-[15px] rounded-[20px] bg-brand p-5 shadow-[0_4px_12px_rgba(255,122,0,0.3)]">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="mb-2 text-sm text-white/80">Total Sales</p>
              <p className="text-[32px] font-extrabold leading-tight text-white">
                {naira(completed.total)}
              </p>
            </div>
            <span className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white">
              <VendorIcon name="trending" className="size-7" />
            </span>
          </div>
          <div className="flex rounded-xl bg-white/15 p-3">
            <div className="flex-1 text-center">
              <p className="mb-1 text-xs text-white/70">Total Orders</p>
              <p className="text-base font-bold text-white">{metrics?.totalOrders ?? 0}</p>
            </div>
            <div className="mx-3 w-px bg-white/30" />
            <div className="flex-1 text-center">
              <p className="mb-1 text-xs text-white/70">Completed</p>
              <p className="text-base font-bold text-white">{completed.count}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 px-[15px]">
          <StatCard icon="clipboard" color="#FF7A00" value={metrics?.totalOrders ?? 0} label="Total Orders" />
          <StatCard icon="clock" color="#FF9500" value={metrics?.pendingOrders ?? 0} label="Pending" />
          <StatCard icon="package" color="#FF3B30" value={metrics?.declinedOrders ?? 0} label="Declined" />
          <StatCard
            icon="star"
            color="#FFB800"
            fill
            value={(rating?.avgRating ?? 0).toFixed(1)}
            label={`Rating (${rating?.totalReviews ?? 0})`}
          />
        </div>

        {/* Store Status card (restaurants/supermarkets only) goes here once ported. */}

        {/* ── Quick Actions ── */}
        <div className="mt-6 px-[15px]">
          <h2 className="mb-4 text-lg font-bold text-[#222]">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((a) => {
              const body = (
                <>
                  <span className="flex size-[68px] items-center justify-center rounded-full bg-brand/10 text-brand sm:size-20">
                    <VendorIcon name={a.icon} className="size-8 sm:size-9" strokeWidth={1.7} />
                  </span>
                  <span className="mt-2.5 text-center text-[13px] font-bold leading-tight text-[#222] sm:text-sm">
                    {a.title}
                  </span>
                  {!a.ready && <span className="mt-0.5 text-[10px] text-[#999]">Soon</span>}
                </>
              );
              const base = "flex flex-col items-center";
              return a.ready ? (
                <Link key={a.title} href={a.href} className={`${base} transition active:opacity-70`}>
                  {body}
                </Link>
              ) : (
                <div key={a.title} aria-disabled title="Coming soon" className={`${base} cursor-not-allowed`}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <div className="mt-6 px-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#222]">Recent Orders</h2>
            <Link href="/merchants/orders" className="text-sm font-semibold text-brand">
              See All
            </Link>
          </div>

          {ordersLoading ? (
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-10 text-center">
              <p className="mt-4 text-lg font-semibold text-[#333]">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#e0e0e0] bg-white p-10 text-center">
              <span className="text-[#ddd]">
                <VendorIcon name="packageEmpty" className="size-[60px]" strokeWidth={1.4} />
              </span>
              <p className="mt-4 text-lg font-semibold text-[#333]">No Orders Yet</p>
              <p className="mt-2 text-sm text-[#999]">
                You&apos;ll see your orders here when customers place them
              </p>
            </div>
          ) : (
            orders.slice(0, 5).map((o) => <OrderCard key={o.order_id} order={o} />)
          )}
        </div>

        {/* ── Upcoming Scheduled Orders ── */}
        {hasSchedulingSupport && (
          <div className="mt-6 px-[15px]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#222]">Upcoming Scheduled Orders</h2>
              <Link href="/merchants/orders?tab=Scheduled" className="text-sm font-semibold text-brand">
                See All
              </Link>
            </div>

            {scheduledOrders.length === 0 ? (
              <div className="flex items-center justify-center rounded-[14px] border border-[#e0e0e0] bg-white p-5">
                <p className="text-[13px] text-[#888]">No upcoming scheduled orders</p>
              </div>
            ) : (
              scheduledOrders
                .slice(0, 3)
                .map((o) => <OrderCard key={o.order_id} order={o} scheduled />)
            )}
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}