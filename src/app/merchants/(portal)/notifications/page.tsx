"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type VendorNotification,
} from "@/lib/api/notifications";
import { VendorIcon, type VendorIconName } from "@/components/vendor/icons";
import { errorMessage } from "@/components/vendor/ui";

// ─── Helpers (same icon/colour per type as mobile) ───────────────────────────

function getNotificationIcon(type: string): { icon: VendorIconName; color: string; bg: string } {
  switch (type) {
    case "ORDER_UPDATE":
      return { icon: "receipt", color: "#007AFF", bg: "#EAF3FF" };
    case "PROMOTION":
      return { icon: "tag", color: "#FE7C09", bg: "#FFF3EA" };
    case "NEW_PRODUCT":
      return { icon: "bagPlus", color: "#34C759", bg: "#EAFAF0" };
    case "REVIEW_REMINDER":
      return { icon: "star", color: "#FFB800", bg: "#FFFBEA" };
    case "new_order":
      return { icon: "cart", color: "#AF52DE", bg: "#F5EAFF" };
    default:
      return { icon: "bell", color: "#888888", bg: "#F5F5F5" };
  }
}

// On the vendor web app only order-related notifications have a page to open.
const NAVIGABLE_TYPES = ["ORDER_UPDATE", "REVIEW_REMINDER", "new_order", "NEW_ORDER"];
const ORDERS_PATH = "/merchants/orders";

function timeAgo(value: string): string {
  // Backend sends MySQL-style "YYYY-MM-DD HH:mm:ss".
  const t = new Date(value.replace(" ", "T")).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, Date.now() - t);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Detail modal ────────────────────────────────────────────────────────────

function NotificationModal({
  item,
  onClose,
  onNavigate,
}: {
  item: VendorNotification;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const icon = getNotificationIcon(item.type);
  const isNavigable = NAVIGABLE_TYPES.includes(item.type);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="mb-4 flex size-16 items-center justify-center rounded-full"
          style={{ backgroundColor: icon.bg, color: icon.color }}
        >
          <VendorIcon name={icon.icon} className="size-7" />
        </span>

        <h2 className="mb-1.5 text-center text-[17px] font-bold text-[#1A1A2E]">{item.title}</h2>
        <p className="mb-4 text-xs text-[#BDBDBD]">{timeAgo(item.created_at)}</p>

        <div className="mb-6 max-h-[220px] w-full overflow-y-auto">
          <p className="whitespace-pre-line text-center text-sm leading-5.5 text-[#555]">
            {item.body}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          {isNavigable && (
            <button
              type="button"
              onClick={onNavigate}
              className="flex items-center justify-center gap-2 rounded-[14px] bg-brand py-3.5 text-[15px] font-bold text-white"
            >
              View Details
              <VendorIcon name="arrowRight" className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-[14px] border-[1.5px] border-[#E8E8E8] py-3 text-[15px] font-semibold text-[#888]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function NotificationRow({
  item,
  onPress,
}: {
  item: VendorNotification;
  onPress: (item: VendorNotification) => void;
}) {
  const icon = getNotificationIcon(item.type);
  return (
    <button
      type="button"
      onClick={() => onPress(item)}
      className={`relative flex w-full items-center px-4 py-3.5 text-left transition hover:bg-[#fafafa] ${
        item.is_read ? "bg-white" : "bg-[#FFFBF7]"
      }`}
    >
      {!item.is_read && (
        <span className="absolute left-1.5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-brand" />
      )}
      <span
        className="mr-3 flex size-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: icon.bg, color: icon.color }}
      >
        <VendorIcon name={icon.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`mb-0.75 block truncate text-sm ${
            item.is_read ? "font-medium text-[#444]" : "font-bold text-[#1A1A2E]"
          }`}
        >
          {item.title}
        </span>
        <span className="mb-1.25 line-clamp-2 block text-[13px] leading-4.5 text-[#777]">
          {item.body}
        </span>
        <span className="block text-[11px] text-[#BDBDBD]">{timeAgo(item.created_at)}</span>
      </span>
      <VendorIcon name="chevron" className="ml-1.5 size-4 shrink-0 text-[#D0D0D0]" />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MerchantNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VendorNotification | null>(null);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    try {
      const res = await getNotifications(pageNum, 20);
      setNotifications((prev) => (reset ? res.notifications : [...prev, ...res.notifications]));
      setUnreadCount(res.unread_count);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.total_pages);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // Web equivalent of pull-to-refresh: refetch when the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchPage(1, true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchPage]);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail, same as mobile.
    }
  }

  function handlePress(item: VendorNotification) {
    // Mark as read straight away, then open the detail modal.
    if (!item.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(item.id).catch(() => {});
    }
    setSelected(item);
  }

  function handleModalNavigate() {
    setSelected(null);
    router.push(ORDERS_PATH);
  }

  function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchPage(page + 1);
  }

  if (loading) {
    return (
      <div className="-mb-24 flex min-h-screen items-center justify-center bg-[#F5F6FA] pb-24">
        <span className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    // -mb-24 / pb-24 lets the page background run behind the fixed tab bar.
    <div className="-mb-24 min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="rounded-b-3xl bg-brand px-4 pb-5 pt-10">
        <div className="mx-auto flex max-w-2xl items-center">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <VendorIcon name="arrowLeft" className="size-6" />
          </button>

          <div className="flex flex-1 items-center justify-center gap-2">
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="flex h-[22px] min-w-5.5 items-center justify-center rounded-full bg-[#FF3B30] px-1.25 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="w-20 text-right text-xs font-semibold text-white/85"
            >
              Mark all read
            </button>
          ) : (
            <span className="w-20" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {error && (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center px-10 pt-20 text-center">
            <span className="mb-5 flex size-24 items-center justify-center rounded-full bg-[#F5F5F5] text-[#ccc]">
              <VendorIcon name="bellOff" className="size-12" strokeWidth={1.5} />
            </span>
            <p className="mb-2 text-xl font-bold text-[#1A1A2E]">No notifications yet</p>
            <p className="text-sm leading-5 text-[#999]">
              Order updates, promotions, and alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-white">
            {notifications.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <div className="ml-18 h-px bg-[#F0F0F0]" />}
                <NotificationRow item={n} onPress={handlePress} />
              </div>
            ))}
          </div>
        )}

        {page < totalPages && (
          <div className="flex justify-center py-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {selected && (
        <NotificationModal
          item={selected}
          onClose={() => setSelected(null)}
          onNavigate={handleModalNavigate}
        />
      )}
    </div>
  );
}