"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type VendorNotification,
} from "@/lib/api/notifications";
import { VendorIcon, type VendorIconName } from "@/components/vendor/icons";
import { errorMessage } from "@/components/vendor/ui";
import { useAuthModalStore } from "@/store/authModalStore";

// image_url comes from get-notifications.php. Declared here so this page works
// even before the shared VendorNotification type is updated; once you add
// `image_url?: string | null` there, this intersection is harmless.
type Notification = VendorNotification & { image_url?: string | null };

// ─── Where "View Details" goes (mirrors the mobile buyer navigation) ─────────

// TODO: set this to your buyer orders page if it isn't /account.
const BUYER_ORDERS_PATH = "/account";
const SHOP_PATH = "/shop";

function destinationFor(type: string): string | null {
  switch (type) {
    case "ORDER_UPDATE":
    case "REVIEW_REMINDER":
      return BUYER_ORDERS_PATH;
    case "PROMOTION":
    case "NEW_PRODUCT":
      return SHOP_PATH;
    default:
      return null;
  }
}

// ─── Helpers (same icon/colour per type as mobile) ───────────────────────────

function getNotificationIcon(type: string): { icon: VendorIconName; color: string; bg: string } {
  switch (type) {
    case "ORDER_UPDATE":
      return { icon: "receipt", color: "#007AFF", bg: "#EAF3FF" };
    case "PROMOTION":
    case "PROMO":
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

function timeAgo(value: string): string {
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

// ─── Notification image ──────────────────────────────────────────────────────
// Renders nothing if the URL fails to load, so a broken link never leaves an
// empty box. Plain <img> on purpose: the URLs are absolute and next/image would
// need the host whitelisted in next.config.

function NotificationImage({ src, className }: { src: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

// ─── Detail dialog ───────────────────────────────────────────────────────────

function NotificationModal({
  item,
  onClose,
  onNavigate,
}: {
  item: Notification;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const icon = getNotificationIcon(item.type);
  const destination = destinationFor(item.type);

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
        className="flex max-h-[90vh] w-full max-w-sm flex-col items-center overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="mb-4 flex size-16 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: icon.bg, color: icon.color }}
        >
          <VendorIcon name={icon.icon} className="size-7" />
        </span>

        <h2 className="mb-1.5 text-center text-[17px] font-bold text-[#1A1A2E]">{item.title}</h2>
        <p className="mb-4 text-xs text-[#BDBDBD]">{timeAgo(item.created_at)}</p>

        {item.image_url ? (
          <NotificationImage
            src={item.image_url}
            className="mb-4 h-40 w-full shrink-0 rounded-xl bg-[#F0F0F0] object-cover"
          />
        ) : null}

        <div className="mb-6 max-h-[220px] w-full overflow-y-auto">
          <p className="whitespace-pre-line text-center text-sm leading-[22px] text-[#555]">
            {item.body}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          {destination && (
            <button
              type="button"
              onClick={() => onNavigate(destination)}
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
  item: Notification;
  onPress: (item: Notification) => void;
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
          className={`mb-[3px] block truncate text-sm ${
            item.is_read ? "font-medium text-[#444]" : "font-bold text-[#1A1A2E]"
          }`}
        >
          {item.title}
        </span>
        <span className="mb-[5px] line-clamp-2 block text-[13px] leading-[18px] text-[#777]">
          {item.body}
        </span>
        <span className="block text-[11px] text-[#BDBDBD]">{timeAgo(item.created_at)}</span>
      </span>
      {item.image_url ? (
        <NotificationImage
          src={item.image_url}
          className="ml-2.5 size-12 shrink-0 rounded-lg bg-[#F0F0F0] object-cover"
        />
      ) : null}
      <VendorIcon name="chevron" className="ml-1.5 size-4 shrink-0 text-[#D0D0D0]" />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    try {
      const res = await getNotifications(pageNum, 20);
      setNotifications((prev) => (reset ? res.notifications : [...prev, ...res.notifications]));
      setUnreadCount(res.unread_count);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.total_pages);
      setError(null);
      setNeedsLogin(false);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setNeedsLogin(true);
      } else {
        setError(errorMessage(err));
      }
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

  function handlePress(item: Notification) {
    if (!item.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(item.id).catch(() => {});
    }
    setSelected(item);
  }

  function handleNavigate(path: string) {
    setSelected(null);
    router.push(path);
  }

  function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchPage(page + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-red-500 px-[5px] text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-brand-deep hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : needsLogin ? (
        <div className="rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="font-semibold">Log in to see your notifications</p>
          <p className="mt-1 text-sm text-ink-soft">
            Order updates, promotions and alerts appear here.
          </p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Log in
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 pt-12 text-center">
              <span className="mb-5 flex size-24 items-center justify-center rounded-full bg-[#F5F5F5] text-[#ccc]">
                <VendorIcon name="bellOff" className="size-12" strokeWidth={1.5} />
              </span>
              <p className="mb-2 text-xl font-bold text-[#1A1A2E]">No notifications yet</p>
              <p className="text-sm leading-5 text-[#999]">
                Order updates, promotions, and alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <div className="ml-[72px] h-px bg-[#F0F0F0]" />}
                  <NotificationRow item={n} onPress={handlePress} />
                </div>
              ))}
            </div>
          )}

          {page < totalPages && (
            <div className="flex justify-center py-5">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand-deep disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <NotificationModal
          item={selected}
          onClose={() => setSelected(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}