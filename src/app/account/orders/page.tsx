"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquareText,
  Package,
  RefreshCw,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { cancelOrder, getOrders, type Order } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";
import { SITE_URL } from "@/lib/config";
import { OrderLiveInfo } from "@/components/orders/OrderLiveInfo";
import { RatingSheet } from "@/components/orders/RatingSheet";
import { ConfirmDialog } from "@/components/orders/ConfirmDialog";

type Tab = "All" | "Pending" | "Accepted" | "Enroute" | "Delivered" | "Cancelled";
const TABS: Tab[] = ["All", "Pending", "Accepted", "Enroute", "Delivered", "Cancelled"];

// Same remembered-dismissals key as the mobile app uses.
const DISMISSED_KEY = "dismissed_order_ratings";

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

const isDelivered = (o: Order) => o.status === "Delivered" || o.status === "Completed";

function matchesTab(o: Order, tab: Tab): boolean {
  if (tab === "All") return true;
  if (tab === "Delivered") return isDelivered(o);
  if (tab === "Cancelled") return o.status === "Cancelled" || o.status === "Rejected";
  return o.status === tab;
}

/**
 * Defensive fallback: if get-orders.php ever returns a relative path
 * instead of the full absolute URL, prefix it with SITE_URL so the browser
 * doesn't resolve it against the frontend's own origin.
 */
function resolveUploadUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path}`;
}

function readDismissed(): number[] {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDismissed(orderId: number) {
  try {
    const list = readDismissed();
    if (!list.includes(orderId)) {
      list.push(orderId);
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
    }
  } catch {
    /* storage unavailable: nothing to remember */
  }
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin("/account/orders");
      router.replace("/");
    }
  }, [authLoading, user, router, openLogin]);

  const fetchOrders = useCallback(async (): Promise<Order[] | null> => {
    try {
      const data = await getOrders();
      setOrders(data.orders);
      setOrdersError(null);
      return data.orders;
    } catch (e) {
      setOrdersError(e instanceof ApiError ? e.message : "Failed to load orders");
      return null;
    } finally {
      setOrdersLoading(false);
      setRefreshing(false);
    }
  }, []);

  // First load: also offer to rate the first delivered, unrated order the
  // user hasn't dismissed before (same behaviour as the mobile app).
  useEffect(() => {
    if (!user) return;
    fetchOrders().then((list) => {
      if (!list) return;
      const dismissed = readDismissed();
      const toRate = list.find(
        (o) => isDelivered(o) && o.is_rated === 0 && !dismissed.includes(o.order_id)
      );
      if (toRate) setRatingOrder(toRate);
    });
  }, [user, fetchOrders]);

  const filteredOrders = useMemo(
    () => (orders ?? []).filter((o) => matchesTab(o, activeTab)),
    [orders, activeTab]
  );

  const counts = useMemo(() => {
    const c = {} as Record<Tab, number>;
    for (const t of TABS) c[t] = (orders ?? []).filter((o) => matchesTab(o, t)).length;
    return c;
  }, [orders]);

  function dismissRating() {
    if (ratingOrder) addDismissed(ratingOrder.order_id);
    setRatingOrder(null);
  }

  function completeRating() {
    const id = ratingOrder?.order_id;
    setOrders((prev) => prev?.map((o) => (o.order_id === id ? { ...o, is_rated: 1 } : o)) ?? prev);
    setRatingOrder(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(cancelTarget.order_id);
      setCancelTarget(null);
      setNotice("Order cancelled successfully.");
      await fetchOrders();
    } catch (e) {
      setCancelError(e instanceof ApiError ? e.message : "Network error. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Order history</h1>
          {orders && (
            <p className="mt-0.5 text-xs text-ink-soft">
              {orders.length} total order{orders.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-xl bg-leaf/10 px-3 py-2 text-sm text-leaf">
          {notice}
        </p>
      )}

      {/* Tabs */}
      <div className="-mx-4 mt-5 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-bg-raised text-ink-soft hover:text-ink"
              }`}
            >
              {tab}
              {counts[tab] > 0 ? ` (${counts[tab]})` : ""}
            </button>
          ))}
        </div>
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
              href="/shop"
              className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Start shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onRate={() => setRatingOrder(order)}
              onCancel={() => {
                setCancelError(null);
                setCancelTarget(order);
              }}
            />
          ))}
        </div>
      )}

      <RatingSheet order={ratingOrder} onDismiss={dismissRating} onComplete={completeRating} />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel order"
        message={`Are you sure you want to cancel order #${cancelTarget?.order_uid ?? ""}?`}
        confirmLabel="Yes, cancel"
        busy={cancelling}
        error={cancelError}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

function OrderCard({
  order,
  onRate,
  onCancel,
}: {
  order: Order;
  onRate: () => void;
  onCancel: () => void;
}) {
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
      {/* Header: order_uid is the identifier. No vendor name or logo,
          because an order can span several vendors. */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink">#{order.order_uid}</p>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
            {order.status}
          </span>
          {order.is_paid === "No" && <span className="text-[11px] font-medium text-clay">Unpaid</span>}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
        <span>{order.date}</span>
        <span>·</span>
        <span>
          {order.items.length} item{order.items.length === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span className="font-medium text-ink">₦{order.total.toLocaleString("en-NG")}</span>
      </div>

      {/* Delivery PIN and Track order (Accepted / Enroute only) */}
      <OrderLiveInfo order={order} />

      {order.items.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
          {order.items.map((item, i) => (
            <div key={item.product_id ?? i} className="flex items-center gap-3">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveUploadUrl(item.image_url)}
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
              <p className="shrink-0 text-sm font-medium text-ink">₦{item.price.toLocaleString("en-NG")}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
        <MessageSquareText size={15} className="mt-0.5 shrink-0 text-ink-soft" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Order note</p>
          <p className={`mt-0.5 text-sm ${order.customer_notes ? "text-ink" : "italic text-ink-soft"}`}>
            {order.customer_notes ?? "No note for this order"}
          </p>
        </div>
      </div>

      {order.status === "Pending" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-clay/10 py-2.5 text-sm font-medium text-clay hover:bg-clay/20"
        >
          ✕ Cancel order
        </button>
      )}

      {isDelivered(order) && order.is_rated === 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRate();
          }}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Star size={15} />
          Rate order
        </button>
      )}

      {isDelivered(order) && order.is_rated === 1 && (
        <p className="mt-4 rounded-xl border border-leaf/30 bg-leaf/10 py-2.5 text-center text-sm font-medium text-leaf">
          ✓ You rated this order
        </p>
      )}
    </div>
  );
}