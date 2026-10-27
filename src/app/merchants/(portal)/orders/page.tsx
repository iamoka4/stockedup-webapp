"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { getOrdersMetric } from "@/lib/api/vendor";
import { errorMessage } from "@/components/vendor/ui";

type TabName = "New" | "Ongoing" | "Completed" | "Scheduled";
const TAB_NAMES: TabName[] = ["New", "Ongoing", "Completed", "Scheduled"];

type Addon = {
  group_name?: string;
  name: string;
  unit_price?: number;
  quantity: number;
  total_price: number;
};

type OrderItem = {
  product_id?: number;
  product_name?: string;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
  image_url?: string;
  special_request?: string | null;
  addons?: Addon[];
};

type Order = {
  order_uid?: string;
  order_id: number;
  customer_name: string;
  date: string;
  items?: OrderItem[];
  status: string;
  subtotal: number;
  vendor_earning?: number;
  order_type?: string;
  scheduled_for?: string;
  customer_notes?: string | null;
};

const naira = (n: number) => `₦${(n ?? 0).toLocaleString("en-NG")}`;

// Relative image paths from the backend need the site origin (same as mobile).
function resolveImage(src?: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `https://stockedup.africa/${src.startsWith("/") ? src.slice(1) : src}`;
}

function statusInfo(status: string) {
  switch (status?.toLowerCase()) {
    case "pending":
      return { bg: "bg-amber-500", text: "Pending" };
    case "accepted":
      return { bg: "bg-orange-500", text: "Accepted" };
    case "enroute":
      return { bg: "bg-sky-500", text: "Enroute" };
    case "completed":
    case "delivered":
      return { bg: "bg-emerald-500", text: "Completed" };
    case "rejected":
      return { bg: "bg-red-500", text: "Rejected" };
    default:
      return { bg: "bg-gray-400", text: status || "Unknown" };
  }
}

function sectionTitle(tab: TabName) {
  switch (tab) {
    case "New":
      return "New Orders";
    case "Ongoing":
      return "Ongoing Orders";
    case "Completed":
      return "Delivered Orders";
    case "Scheduled":
      return "Scheduled Orders";
  }
}

function OrderCard({ order }: { order: Order }) {
  const s = statusInfo(order.status);
  const items = order.items ?? [];
  const isScheduled = order.order_type === "scheduled";

  return (
    <div className="rounded-2xl border border-line bg-white dark:bg-bg-raised p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{order.customer_name}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-ink-soft">{order.date}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${s.bg}`}>
            {s.text}
          </span>
          {isScheduled && order.scheduled_for && (
            <span className="rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-[11px] font-bold text-brand-deep">
              🕒 {order.scheduled_for}
            </span>
          )}
        </div>
      </div>

      {/* Order id + amount */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-ink-soft">
          {order.order_uid ? order.order_uid : `#${order.order_id}`}
        </span>
        <span className="text-base font-bold text-brand-deep">{naira(order.subtotal)}</span>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="mt-4 border-t border-gray-100 dark:border-line pt-4">
          <p className="mb-3 text-xs font-bold uppercase text-gray-500 dark:text-ink-soft">
            Order Items ({items.length})
          </p>
          <div className="space-y-3">
            {items.map((prod, i) => {
              const name = prod.name || prod.product_name || `Product #${prod.product_id}`;
              const image = resolveImage(prod.image_url || prod.image);
              const addons = prod.addons ?? [];
              return (
                <div key={i}>
                  <div className="flex items-center gap-3">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="size-11 shrink-0 rounded-lg bg-gray-100 dark:bg-bg-elevated object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-bg-elevated text-lg">
                        🛍️
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-ink">{name}</p>
                      <p className="text-[13px] text-gray-500 dark:text-ink-soft">Qty: {prod.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-ink">
                      {naira(prod.price ?? 0)}
                    </p>
                  </div>

                  {addons.length > 0 && (
                    <div className="ml-14 mt-1.5 space-y-1 rounded-lg bg-[#FFF8F0] p-2">
                      {addons.map((a, ai) => (
                        <div key={ai} className="flex justify-between gap-2 text-xs text-[#8A5A00]">
                          <span className="flex-1">
                            + {a.name} ×{a.quantity}
                          </span>
                          <span className="font-semibold">{naira(a.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {prod.special_request && (
                    <p className="ml-14 mt-1.5 text-xs italic text-gray-600 dark:text-ink-soft">
                      📝 &ldquo;{prod.special_request}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer note */}
      <div className="mt-4 flex items-start gap-2 border-t border-gray-100 dark:border-line pt-3">
        <span className="text-sm">📝</span>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-ink-soft">
            Customer Note
          </p>
          <p
            className={`text-[13px] leading-5 ${
              order.customer_notes ? "text-gray-800 dark:text-ink" : "italic text-gray-400 dark:text-ink-soft"
            }`}
          >
            {order.customer_notes ?? "No note for this order"}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabName>("New");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // /merchants/orders?tab=Scheduled opens the Scheduled tab (same as mobile).
  useEffect(() => {
    const t = params.get("tab");
    if (t && (TAB_NAMES as string[]).includes(t)) setActiveTab(t as TabName);
  }, [params]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getOrdersMetric();
      setOrders((data.orders ?? []) as unknown as Order[]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const st = (o: Order) => o.status?.toLowerCase();
    switch (activeTab) {
      case "New":
        return orders.filter((o) => st(o) === "pending");
      case "Ongoing":
        return orders.filter((o) => st(o) === "accepted" || st(o) === "enroute");
      case "Completed":
        return orders.filter((o) => st(o) === "delivered" || st(o) === "completed");
      case "Scheduled":
        return orders
          .filter(
            (o) =>
              o.order_type === "scheduled" &&
              st(o) !== "delivered" &&
              st(o) !== "completed" &&
              st(o) !== "rejected",
          )
          .sort((a, b) => {
            const da = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
            const db = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
            return da - db;
          });
    }
  }, [activeTab, orders]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      {/* Segmented tabs */}
      <div className="flex rounded-2xl p-1">
        {TAB_NAMES.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`my-0.5 flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              activeTab === tab ? "bg-brand text-black" : "text-gray-500 dark:text-ink-soft"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">{sectionTitle(activeTab)}</h1>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="text-sm font-semibold text-brand-deep underline underline-offset-4"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-gray-500 dark:text-ink-soft">Loading orders...</p>
        ) : error ? (
          <p role="alert" className="py-10 text-center font-semibold text-red-600 dark:text-clay">
            Failed to load orders
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center font-medium text-gray-500 dark:text-ink-soft">
            No {activeTab.toLowerCase()} orders found
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <OrderCard key={o.order_id} order={o} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function MerchantOrdersPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}