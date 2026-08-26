"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrders, type Order } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-leaf/10 text-leaf",
  Pending: "bg-brand-warm text-brand-deep",
  Processing: "bg-brand-warm text-brand-deep",
  Cancelled: "bg-clay/10 text-clay",
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
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

      {ordersLoading ? (
        <p className="mt-8 text-sm text-ink-soft">Loading orders…</p>
      ) : ordersError ? (
        <p className="mt-8 text-sm text-clay">{ordersError}</p>
      ) : !orders || orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-line bg-bg-raised p-10 text-center">
          <Package size={32} className="text-ink-soft" />
          <p className="mt-3 text-sm font-medium text-ink">No orders yet</p>
          <p className="mt-1 text-sm text-ink-soft">Your past orders will show up here.</p>
          <Link
            href="/"
            className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusClass = STATUS_STYLES[order.status] ?? "bg-ink/5 text-ink-soft";
  const visibleItems = order.items.slice(0, 3);
  const moreCount = order.items.length - visibleItems.length;

  return (
    <Link
      href={`/account/orders/${order.order_uid}`}
      className="block rounded-2xl border border-line bg-bg-raised p-4 transition-colors hover:border-brand-deep/30"
    >
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
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
          {order.status}
        </span>
      </div>

      {/* Item thumbnails — quick visual of what was ordered */}
      {visibleItems.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {visibleItems.map((item, i) => (
              <div
                key={item.product_id ?? i}
                className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 border-bg-raised bg-brand-tint"
              >
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-soft">
                    <Package size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            {order.items.length} item{order.items.length === 1 ? "" : "s"}
            {moreCount > 0 ? ` · +${moreCount} more` : ""}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <p className="text-xs text-ink-soft">Order #{order.order_uid}</p>
        <p className="text-sm font-semibold text-ink">
          ₦{order.total.toLocaleString("en-NG")}
        </p>
      </div>
    </Link>
  );
}