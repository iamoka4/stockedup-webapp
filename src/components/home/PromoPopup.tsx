"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { PromoPopupItem } from "@/lib/api/promo-popups";

const HREF: Record<string, string> = {
  restaurants: "/restaurants",
  supermarkets: "/supermarkets",
  groceries: "/vendors",
};

// Promo ids already seen in this browser tab session.
const KEY = "promo-popups-seen";
function readSeen(): number[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeSeen(ids: number[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: popup may reappear, that's fine */
  }
}

export function PromoPopup({ promos }: { promos: PromoPopupItem[] }) {
  const [seen, setSeen] = useState<number[] | null>(null);

  // Read storage after mount so server and browser render the same HTML.
  useEffect(() => setSeen(readSeen()), []);

  const current = seen ? promos.find((p) => !seen.includes(p.id)) : undefined;
  if (!current) return null;

  const close = () => {
    const next = [...(seen ?? []), current.id];
    writeSeen(next);
    setSeen(next);
  };
  const href = HREF[current.cta_target];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-brand text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white text-ink"
        >
          <X size={18} />
        </button>

        {current.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image} alt={current.title} className="w-full" />
        ) : (
          <div className="flex flex-col items-center px-7 pb-8 pt-12 text-center">
            {current.badge && (
              <span className="mb-3 rounded-full bg-white/25 px-3.5 py-1.5 text-xs font-bold">
                {current.badge}
              </span>
            )}
            <h2 className="font-display text-4xl font-black leading-tight">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="mt-2.5 text-base font-semibold">{current.subtitle}</p>
            )}
            {href && (
              <Link
                href={href}
                onClick={close}
                className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-extrabold text-brand"
              >
                {current.cta_text || "Order now"}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}