"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { VendorListingCard } from "@/components/vendors/VendorListing";
import { VendorTypeTabs } from "@/components/vendors/VendorTypeTabs";
import { vendorToListingItem } from "@/lib/vendors/toListingItem";
import { useCityFilteredVendors } from "@/lib/hooks/useCityFilteredVendors";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Vendor } from "@/lib/api/types";

type ViewMode = "list" | "grid";

// Groceries tab of the vendors page. Same layout as the Restaurants and
// Supermarkets pages (see VendorListing): back arrow, centered title, list/grid
// toggle, search icon, type tabs, then the cards.
export function VendorGridClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);
  const { vendors, isFetching } = useCityFilteredVendors(initialVendors);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const grid = viewMode === "grid";

  // Alphabetical by shop name, then filtered by the search text.
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...vendors]
      .sort((a, b) => (a.shop_name || "").localeCompare(b.shop_name || ""))
      .filter(
        (v) =>
          !q ||
          [v.shop_name, v.city, v.state].some((f) =>
            (f || "").toLowerCase().includes(q)
          )
      )
      .map((v) => vendorToListingItem(v));
  }, [vendors, search]);

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
              Groceries
              <span className="block text-xs font-medium text-ink-soft">in {label}</span>
            </h1>

            <div className="flex w-24 items-center justify-end gap-2">
              <div className="flex gap-0.5 rounded-lg bg-bg p-0.5">
                {(
                  [
                    ["list", List, "List view"],
                    ["grid", LayoutGrid, "Grid view"],
                  ] as const
                ).map(([mode, Icon, btnLabel]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    aria-label={btnLabel}
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
                placeholder="Search groceries"
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

      {/* Groceries / Restaurants / Supermarkets tabs */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <VendorTypeTabs active="groceries" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4">
        {isFetching && items.length === 0 ? (
          <p className="py-20 text-center text-sm text-ink-soft">
            Loading groceries in {label}…
          </p>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bold text-ink">No vendors found in {label}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {search
                ? `Nothing matches "${search}". Try a different search.`
                : "Try a different search or check back soon."}
            </p>
          </div>
        ) : (
          <ul
            className={
              grid
                ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                : "mx-auto grid max-w-2xl grid-cols-1 gap-6"
            }
          >
            {items.map((item) => (
              <VendorListingCard
                key={item.id}
                item={item}
                grid={grid}
                FallbackIcon={ShoppingCart}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}