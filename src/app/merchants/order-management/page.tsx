"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrdersMetric, updateOrderStatus } from "@/lib/api/vendor";
import { errorMessage } from "@/components/vendor/ui";

type OrderStatus = "pending" | "accepted" | "rejected" | "completed" | "enroute";
type OrderFilter = "all" | OrderStatus;
type DateFilter = "all" | "today" | "week" | "month";

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
  vendor_order_id?: number;
  customer_name: string;
  date?: string;
  created_at?: string;
  items?: OrderItem[];
  status: string;
  subtotal: number;
  order_type?: string;
  scheduled_for?: string;
};

const STATUS_FILTERS: OrderFilter[] = [
  "all",
  "pending",
  "accepted",
  "enroute",
  "completed",
  "rejected",
];

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const COUNT_KEYS: Record<string, string> = {
  pending: "pendingOrders",
  accepted: "acceptedOrders",
  enroute: "enrouteOrders",
  completed: "deliveredOrders",
  rejected: "declinedOrders",
};

const REJECTION_REASONS = [
  "Item out of stock",
  "Unable to deliver to location",
  "Order quantity too large",
  "Temporary store closure",
  "Item price has changed",
  "Other",
];

const naira = (n: number) => `₦${(n ?? 0).toLocaleString("en-NG")}`;

function resolveImage(src?: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `https://stockedup.africa/${src.startsWith("/") ? src.slice(1) : src}`;
}

// True while it is before 09:00 in Lagos (scheduled orders can't be actioned yet).
function isBeforeOpeningHours(): boolean {
  const parts = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  return hour < 9;
}

function formatScheduled(value?: string) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("en-NG", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos",
    });
  } catch {
    return value;
  }
}

// ─── Date helpers (same logic as mobile) ─────────────────────────────────────
function parseOrderDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  const parts = str.replace(/,/g, "").split(/\s+/);
  if (parts.length >= 3) {
    const monthStr = parts[0].substring(0, 3);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = months.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

const isToday = (dateStr: string): boolean => {
  const d = parseOrderDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const isThisWeek = (dateStr: string): boolean => {
  const d = parseOrderDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const dateMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.abs(nowMidnight - dateMidnight) / 86_400_000 <= 7;
};

const isThisMonth = (dateStr: string): boolean => {
  const d = parseOrderDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
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

// ─── Order card ──────────────────────────────────────────────────────────────
function OrderCard({
  order,
  locked,
  busy,
  onAccept,
  onReject,
}: {
  order: Order;
  locked: boolean;
  busy: boolean;
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
}) {
  const items = order.items ?? [];
  const isScheduled = order.order_type === "scheduled";
  const scheduledDisplay = formatScheduled(order.scheduled_for);
  // Vendor only accepts/rejects pending orders. Everything after is driven by the rider app.
  const showActions = order.status?.toLowerCase() === "pending";
  const actionsDisabled = busy || (isScheduled && locked);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-gray-900">{order.customer_name}</p>
          <p className="mt-0.5 text-xs text-gray-400">{order.date || order.created_at}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize text-white ${statusColor(
              order.status,
            )}`}
          >
            {order.status}
          </span>
          {isScheduled && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
              📅 Scheduled
            </span>
          )}
        </div>
      </div>

      {isScheduled && scheduledDisplay && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 p-2 text-xs text-violet-800">
          <span>📅</span>
          <span>
            Delivery scheduled for <strong>{scheduledDisplay}</strong>
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {order.order_uid ? order.order_uid : `#${order.order_id}`}
        </span>
        <span className="text-lg font-bold text-orange-500">{naira(order.subtotal)}</span>
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-2.5 rounded-xl bg-[#f9f9f9] p-3">
          <p className="text-xs font-bold uppercase text-gray-400">
            Order Items ({items.length})
          </p>
          {items.map((prod, idx) => {
            const name = prod.name || prod.product_name || `Product #${prod.product_id}`;
            const image = resolveImage(prod.image_url || prod.image);
            const addons = prod.addons ?? [];
            return (
              <div key={`${prod.product_id}-${idx}`}>
                <div className="flex items-center gap-3">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      className="size-12.5 shrink-0 rounded-lg bg-gray-200 object-cover"
                    />
                  ) : (
                    <span className="flex size-12.5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
                      🛍️
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-[13px] text-gray-500">Qty: {prod.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{naira(prod.price ?? 0)}</p>
                </div>

                {addons.length > 0 && (
                  <div className="ml-15.5 mt-1.5 space-y-1 rounded-lg bg-[#FFF8F0] p-2">
                    {addons.map((a, aIdx) => (
                      <div key={aIdx} className="flex justify-between gap-2 text-xs text-[#8A5A00]">
                        <span className="flex-1 truncate">
                          + {a.name} ×{a.quantity}
                        </span>
                        <span className="font-semibold">{naira(a.total_price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {prod.special_request && (
                  <p className="ml-15.5 mt-1.5 text-xs italic text-gray-600">
                    📝 &ldquo;{prod.special_request}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showActions && (
        <div className="mt-3">
          {isScheduled && locked && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-xs font-medium text-violet-800">
              <span>⏰</span>
              <span>Actions available at 9:00 AM when the vendor opens</span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={() => onAccept(order)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-orange-500 px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓ Accept
            </button>
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={() => onReject(order)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-red-500 px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rejection modal ─────────────────────────────────────────────────────────
function RejectModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-9 sm:rounded-3xl"
      >
        <h2 id="reject-title" className="mb-1 text-lg font-extrabold text-gray-900">
          Reason for Rejection
        </h2>
        <p className="mb-5 text-[13px] text-gray-400">
          Please select a reason before rejecting this order.
        </p>

        <div className="space-y-2">
          {REJECTION_REASONS.map((r) => {
            const active = reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition ${
                  active ? "border-orange-500 bg-[#fff0e6]" : "border-transparent bg-[#f8f8f8]"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-orange-500" : "border-gray-300"
                  }`}
                >
                  {active && <span className="size-2.5 rounded-full bg-orange-500" />}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    active ? "font-semibold text-gray-900" : "text-gray-600"
                  }`}
                >
                  {r}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-[#f0f0f0] py-3.5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!reason}
            className="flex-1 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            Reject Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const [actionError, setActionError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null);

  // Re-check the 9am Lagos lock every minute so buttons enable on their own.
  const [locked, setLocked] = useState<boolean>(() => isBeforeOpeningHours());
  useEffect(() => {
    const id = setInterval(() => setLocked(isBeforeOpeningHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getOrdersMetric();
      setOrders((data.orders ?? []) as unknown as Order[]);
      setMetrics((data.metrics ?? {}) as unknown as Record<string, number>);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusStr = (order.status || "").toLowerCase();
      const statusMatch =
        statusFilter === "all" ||
        statusStr === statusFilter ||
        (statusFilter === "completed" && (statusStr === "delivered" || statusStr === "completed"));

      const dateMatch = (() => {
        if (dateFilter === "all") return true;
        const ds = order.date || order.created_at || "";
        if (!ds) return false;
        if (dateFilter === "today") return isToday(ds);
        if (dateFilter === "week") return isThisWeek(ds);
        if (dateFilter === "month") return isThisMonth(ds);
        return true;
      })();

      return statusMatch && dateMatch;
    });
  }, [orders, statusFilter, dateFilter]);

  const handleAccept = async (order: Order) => {
    setActionError(null);
    setBusyOrderId(order.order_id);
    try {
      await updateOrderStatus({
        orderId: order.order_id,
        vendorOrderId: order.vendor_order_id,
        status: "accepted",
      });
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget || !reason) return;
    const order = rejectTarget;
    setRejectTarget(null);
    setActionError(null);
    setBusyOrderId(order.order_id);
    try {
      await updateOrderStatus({
        orderId: order.order_id,
        vendorOrderId: order.vendor_order_id,
        status: "rejected",
        rejectionReason: reason,
      });
      await load();
    } catch (err) {
      setActionError(errorMessage(err) || "Something went wrong. Please try again.");
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Order Management</h1>
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

      {/* Status filter */}
      <div className="mt-5">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((item) => {
            const countKey = COUNT_KEYS[item];
            const count = countKey ? (metrics[countKey] ?? 0) : 0;
            const active = statusFilter === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setStatusFilter(item)}
                className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                  active ? "bg-orange-500 font-bold text-white" : "bg-[#ececec] text-gray-600"
                }`}
              >
                {item === "all" ? "All" : item}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date filter */}
      <div className="mt-3">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.8px] text-gray-400">
          Date
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DATE_FILTERS.map(({ key, label }) => {
            const active = dateFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDateFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  active ? "bg-orange-500 font-bold text-white" : "bg-[#ececec] text-gray-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {!loading && !error && (
        <p className="mb-3 mt-4 text-[13px] text-gray-400">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-3 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {actionError}
        </p>
      )}

      <div className="mt-2">
        {loading ? (
          <p className="py-10 text-center text-gray-500">Loading orders...</p>
        ) : error ? (
          <p role="alert" className="py-10 text-center font-semibold text-red-600">
            Failed to load orders
          </p>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-500">
            <span className="text-4xl">🧾</span>
            <p className="mt-2.5 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((o) => (
              <OrderCard
                key={o.order_id}
                order={o}
                locked={locked}
                busy={busyOrderId === o.order_id}
                onAccept={handleAccept}
                onReject={setRejectTarget}
              />
            ))}
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal onCancel={() => setRejectTarget(null)} onConfirm={handleConfirmReject} />
      )}
    </section>
  );
}