"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  Navigation,
  Search,
  Star,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

type BusinessType = "restaurant" | "supermarket";
type ViewMode = "list" | "grid";

const COPY = {
  restaurant: {
    title: "Restaurants",
    searchPlaceholder: "Search restaurants",
    emptyTitle: "No restaurants found",
    emptyDesc: "Try a different search or check back soon.",
    errorText: "Failed to load restaurants",
    Icon: UtensilsCrossed,
  },
  supermarket: {
    title: "Supermarkets",
    searchPlaceholder: "Search supermarkets",
    emptyTitle: "No supermarkets found",
    emptyDesc: "Try a different search or check back soon.",
    errorText: "Failed to load supermarkets",
    Icon: Store,
  },
} as const;

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function VendorCard({
  item,
  grid,
  FallbackIcon,
}: {
  item: VendorListingItem;
  grid: boolean;
  FallbackIcon: typeof Store;
}) {
  const isOpen = item.status === "open";
  const rating = item.rating?.average ?? null;
  const fee = item.delivery?.estimate ?? null;

  return (
    <li>
      <Link
        href={`/vendors/${item.id}`}
        className="block overflow-hidden rounded-2xl border border-line bg-bg-raised pb-3 shadow-md shadow-black/5 transition hover:shadow-lg"
      >
        {/* Cover + overlapping logo and heart */}
        <div
          className={`relative mb-5 w-full bg-brand-tint ${
            grid ? "h-[120px]" : "h-40"
          }`}
        >
          {item.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center bg-brand/10 text-brand">
              <FallbackIcon size={32} />
            </span>
          )}

          <span
            className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[9px] font-black tracking-wide text-white shadow ${
              isOpen ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>

          <div className="absolute -bottom-5 left-4 size-12 rounded-lg bg-white p-0.5 shadow-md">
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.logo}
                alt=""
                loading="lazy"
                className="size-full rounded-md object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center rounded-md bg-brand/10 text-brand">
                <FallbackIcon size={20} />
              </span>
            )}
          </div>

          {/* Decorative, same as mobile (not interactive yet) */}
          <span
            aria-hidden
            className="absolute -bottom-4 right-4 grid size-8 place-items-center rounded-full bg-white text-ink-soft shadow-md"
          >
            <Heart size={16} />
          </span>
        </div>

        <div className="px-4 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate font-bold text-ink">
              {item.shop_name}
            </h3>
            <span className="tabular flex items-center gap-1 rounded-xl bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
              <Star size={10} />
              {rating !== null ? rating.toFixed(1) : "0.0"}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            {item.city ? (
              <span className="flex min-w-0 items-center gap-1 text-[13px] text-ink-soft">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">
                  {item.city}
                  {item.state ? `, ${item.state}` : ""}
                </span>
              </span>
            ) : (
              <span />
            )}
            {fee !== null && (
              <span className="tabular flex shrink-0 items-center gap-1 rounded-lg bg-bg px-2 py-1 text-[11px] font-semibold text-ink">
                <Bike size={11} />
                {naira(fee)}
              </span>
            )}
          </div>

          {item.distance_km !== null && (
            <div className="mt-2">
              <span className="tabular inline-flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-[11px] font-semibold text-ink">
                <Navigation size={11} />
                {item.distance_km.toFixed(1)} km
              </span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

export function VendorListing({
  businessType,
  items,
  failed = false,
}: {
  businessType: BusinessType;
  items: VendorListingItem[];
  failed?: boolean;
}) {
  const copy = COPY[businessType];
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const grid = viewMode === "grid";

  // Alphabetical by shop name, then filtered by the search text.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...items]
      .sort((a, b) => (a.shop_name || "").localeCompare(b.shop_name || ""))
      .filter(
        (v) =>
          !q ||
          [v.shop_name, v.city, v.state].some((f) =>
            (f || "").toLowerCase().includes(q)
          )
      );
  }, [items, search]);

  // Closing the field also clears the query, so the list is never filtered
  // by text the user can't see.
  const toggleSearch = () => {
    if (searchOpen) setSearch("");
    setSearchOpen((o) => !o);
  };

  return (
    <div className="min-h-[60vh] bg-bg">
      <header className="border-b border-line bg-bg-raised">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center">
            <div className="w-24">
              <Link
                href="/"
                aria-label="Go back"
                className="grid size-9 place-items-center rounded-[10px] bg-bg text-ink"
              >
                <ArrowLeft size={20} />
              </Link>
            </div>

            <h1 className="flex-1 truncate text-center font-display text-lg font-extrabold text-ink">
              {copy.title}
            </h1>

            <div className="flex w-24 items-center justify-end gap-2">
              <div className="flex gap-0.5 rounded-lg bg-bg p-0.5">
                {(
                  [
                    ["list", List, "List view"],
                    ["grid", LayoutGrid, "Grid view"],
                  ] as const
                ).map(([mode, Icon, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    aria-label={label}
                    aria-pressed={viewMode === mode}
                    className={`rounded-md p-[5px] ${
                      viewMode === mode
                        ? "bg-white text-brand shadow-sm"
                        : "text-ink-soft/70"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={toggleSearch}
                aria-label={searchOpen ? "Close search" : "Search"}
                className={`grid size-8 place-items-center rounded-full ${
                  searchOpen ? "bg-brand text-white" : "bg-bg text-ink"
                }`}
              >
                {searchOpen ? <X size={16} /> : <Search size={16} />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="mt-3 flex h-10 items-center gap-2 rounded-[10px] bg-bg px-3">
              <Search size={16} className="shrink-0 text-ink-soft" />
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="text-ink-soft"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4">
        {failed ? (
          <p className="py-20 text-center text-sm text-red-500">
            {copy.errorText}
          </p>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bold text-ink">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{copy.emptyDesc}</p>
          </div>
        ) : (
          <ul
            className={
              grid
                ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                : "mx-auto grid max-w-2xl grid-cols-1 gap-6"
            }
          >
            {visible.map((item) => (
              <VendorCard
                key={item.id}
                item={item}
                grid={grid}
                FallbackIcon={copy.Icon}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}