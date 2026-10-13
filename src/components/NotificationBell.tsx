"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/api/notifications";

/**
 * Bell with an unread badge, linking to the notifications inbox.
 * Same source as the mobile app: unread_count from get-notifications.php.
 * Render it only for logged-in users.
 *
 * `className` controls display/visibility (default "flex"), e.g. "hidden md:flex".
 */
export function NotificationBell({
  variant = "default",
  size = "md",
  className = "flex",
}: {
  variant?: "default" | "onBrand";
  size?: "sm" | "md";
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const n = await getUnreadNotificationCount();
        if (alive) setCount(n);
      } catch {
        /* not logged in, offline, etc.: the bell just shows no badge */
      }
    };

    load();
    const timer = setInterval(load, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const look =
    variant === "onBrand"
      ? "border-2 border-white text-white hover:bg-white hover:text-brand-deep"
      : "border border-line bg-bg-raised text-ink hover:border-brand hover:text-brand-deep";

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      className={`relative shrink-0 items-center justify-center rounded-full transition ${dims} ${look} ${className}`}
    >
      <Bell size={size === "sm" ? 16 : 19} fill={count > 0 ? "currentColor" : "none"} />
      {count > 0 && (
        <span className="tabular absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-red-500 px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}