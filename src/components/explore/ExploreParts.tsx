"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bike,
  Navigation,
  ShoppingBasket,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import type { Product } from "@/lib/api/types";
import { isOut, naira, type Row } from "@/lib/explore/search";

export const PRIMARY =
  "cursor-pointer rounded-full bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-deep";
export const SECONDARY =
  "cursor-pointer rounded-full border border-line px-6 py-3 font-bold text-ink transition hover:border-brand";

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
      <div className="size-9 animate-spin rounded-full border-4 border-brand/25 border-t-brand" />
      <p className="text-ink-soft">{label}</p>
    </div>
  );
}

export function Notice({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto my-10 flex max-w-xl flex-col items-center rounded-3xl border border-line bg-bg-raised px-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand-tint text-brand">
        {icon}
      </span>
      <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-ink-soft">{text}</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">{children}</div>
    </div>
  );
}

const KIND_ICON = {
  restaurant: UtensilsCrossed,
  supermarket: Store,
  grocery: ShoppingBasket,
} as const;

export function BizCard({ r }: { r: Row }) {
  const b = r.b;
  const Fallback = KIND_ICON[b.kind];
  const pill =
    "flex items-center gap-1 rounded-lg bg-bg-raised px-2 py-1 text-ink";

  return (
    <Link
      href={`/vendors/${b.id}`}
      className="flex h-full items-center gap-3 rounded-2xl border border-line bg-bg p-3 transition hover:border-brand"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
        {b.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={b.image}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-brand">
            <Fallback size={24} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-bold">{b.name}</h3>
          {b.open !== null && (
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white ${
                b.open ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {b.open ? "OPEN" : "CLOSED"}
            </span>
          )}
        </div>

        {r.categories.length > 0 && (
          <p className="truncate text-xs text-ink-soft">
            {r.categories.join(" · ")}
          </p>
        )}
        {r.sells.length > 0 && (
          <p className="truncate text-xs font-semibold text-brand-deep">
            Sells {r.sells.join(", ")}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          {b.rating !== null && (
            <span className={`tabular ${pill}`}>
              <Star size={10} />
              {b.rating.toFixed(1)}
            </span>
          )}
          {b.fee !== null && (
            <span className={`tabular ${pill}`}>
              <Bike size={11} />
              {/* Without a distance the API only knows the base fee. */}
              {b.distanceKm === null ? "from " : ""}
              {naira(b.fee)}
            </span>
          )}
          {b.distanceKm !== null && (
            <span className={`tabular ${pill}`}>
              <Navigation size={11} />
              {b.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCard({ p, vendor }: { p: Product; vendor: string }) {
  const out = isOut(p);
  return (
    <Link
      href={`/products/${p.id}`}
      className="group block h-full rounded-2xl border border-line bg-bg p-3 transition hover:border-brand"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-tint">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center font-display text-3xl font-bold text-brand-deep">
            {(p.name || "?").charAt(0).toUpperCase()}
          </span>
        )}
        {out && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white">
            OUT OF STOCK
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-bold">{p.name}</p>
      <p className="tabular text-sm text-brand-deep">
        {naira(Number(p.price))}
        {p.unit ? <span className="text-ink-soft"> / {p.unit}</span> : null}
      </p>
      {vendor && <p className="mt-0.5 truncate text-xs text-ink-soft">{vendor}</p>}
    </Link>
  );
}

// A titled, paged list: shows `initial` items and a "Show more" button.
export function Section<T>({
  title,
  items,
  initial,
  grid,
  keyOf,
  render,
}: {
  title: string;
  items: T[];
  initial: number;
  grid: string;
  keyOf: (item: T) => string;
  render: (item: T) => React.ReactNode;
}) {
  const [shown, setShown] = useState(initial);
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-brand-deep">
        {title}{" "}
        <span className="font-sans text-sm font-semibold text-ink-soft">
          ({items.length})
        </span>
      </h2>
      <ul className={grid}>
        {items.slice(0, shown).map((it) => (
          <li key={keyOf(it)}>{render(it)}</li>
        ))}
      </ul>
      {items.length > shown && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + initial)}
            className={SECONDARY}
          >
            Show more
          </button>
        </div>
      )}
    </section>
  );
}