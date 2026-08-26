"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MessageSquareText } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrders, type Order } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

type Tab = "All" | "Pending" | "Delivered" | "Cancelled";

// Matches mobile's STATUS_COLORS one-for-one, translated to the site's
// existing design tokens where one exists (brand-warm/brand-deep for
// pending-ish states, leaf for delivered/completed, clay for
// rejected/cancelled) and a plain Tailwind color for the two states that
// don't have a design-token equivalent yet (Enroute, Processing) — swap
// these for real tokens if/when the design system adds them.
const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-brand-warm text-brand-deep",
  Accepted: "bg-brand-warm text-brand-deep",
  Processing: "bg-blue-50 text-blue-700",
  Enroute: "bg-blue-50 text-blue-700",
  Delivered: "bg-leaf/10 text-leaf",
  Completed: "bg-leaf/10 text-leaf",
  Rejected: "bg-clay/10 text-clay",
  Cancelled: "bg-clay/10 text-clay",
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const openLogin = useAuthModalStore((s) => s.openLogin);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin("/account/orders");
      router.replace("/");
    }
  }, [authLoading, user, router, openLogin]);

  useEffect(() => {
    if (!user) return;
    getOrders()
      .then((data) => setOrders(data.orders))
      .catch((e) => setOrdersError(e instanceof ApiError ? e.message : "Failed to load orders"))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeTab === "All") return orders;
    if (activeTab === "Delivered") {
      return orders.filter((o) => o.status === "Delivered" || o.status === "Completed");
    }
    if (activeTab === "Cancelled") {
      return orders.filter((o) => o.status === "Cancelled" || o.status === "Rejected");
    }
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">Order history</h1>

      {/* Tabs */}
      <div className="mt-5 flex gap-1.5 rounded-full bg-bg-raised p-1">
        {(["All", "Pending", "Delivered", "Cancelled"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <p className="mt-8 text-sm text-ink-soft">Loading orders…</p>
      ) : ordersError ? (
        <p className="mt-8 text-sm text-clay">{ordersError}</p>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-line bg-bg-raised p-10 text-center">
          <Package size={32} className="text-ink-soft" />
          <p className="mt-3 text-sm font-medium text-ink">
            {activeTab === "All" ? "No orders yet" : `No ${activeTab.toLowerCase()} orders`}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {activeTab === "All" ? "Your past orders will show up here." : "Try a different tab."}
          </p>
          {activeTab === "All" && (
            <Link
              href="/"
              className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Start shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const statusClass = STATUS_STYLES[order.status] ?? "bg-ink/5 text-ink-soft";

  function goToDetail() {
    router.push(`/account/orders/${order.order_uid}`);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
      className="cursor-pointer rounded-2xl border border-line bg-bg-raised p-4 transition-colors hover:border-brand-deep/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {order.shop_logo ? (
            <img
              src={order.shop_logo}
              alt={order.store_name}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-soft">
              <Package size={18} />
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-ink">{order.store_name}</p>
            <p className="text-xs text-ink-soft">{order.date}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
            {order.status}
          </span>
          {order.is_paid === "No" && (
            <span className="text-[11px] font-medium text-clay">Unpaid</span>
          )}
        </div>
      </div>

      {/* Itemized breakdown — full list, matching the mobile app, rather
          than a name/thumbnail preview */}
      {order.items.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
          {order.items.map((item, i) => (
            <div key={item.product_id ?? i} className="flex items-center gap-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink-soft">
                  <Package size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-ink-soft">Qty: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-ink">
                ₦{item.price.toLocaleString("en-NG")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Order note — always visible, matching mobile */}
      <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
        <MessageSquareText size={15} className="mt-0.5 shrink-0 text-ink-soft" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Order note</p>
          <p className={`mt-0.5 text-sm ${order.customer_notes ? "text-ink" : "italic text-ink-soft"}`}>
            {order.customer_notes ?? "No note for this order"}
          </p>
        </div>
      </div>

      {/* Total + order id */}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="text-xs text-ink-soft">Order #{order.order_uid}</p>
        <p className="text-sm font-semibold text-ink">₦{order.total.toLocaleString("en-NG")}</p>
      </div>
    </div>
  );
}