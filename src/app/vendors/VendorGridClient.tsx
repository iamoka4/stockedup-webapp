"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, Store, X } from "lucide-react";
import { VendorListingCard } from "@/components/vendors/VendorListing";
import { vendorToListingItem } from "@/lib/vendors/toListingItem";
import { useCityFilteredVendors } from "@/lib/hooks/useCityFilteredVendors";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Vendor } from "@/lib/api/types";

type ViewMode = "list" | "grid";

// Groceries tab of the vendors page. Mirrors the mobile Vendors page:
// list view by default, a list/grid toggle, and a search icon that opens a
// search field (closing it clears the query).
export function VendorGridClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const city = useUiStore((s) => s.city);
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

  const toggleSearch = () => {
    if (searchOpen) setSearch("");
    setSearchOpen((o) => !o);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Groceries in {cityLabel(city)}
          </h1>
          <p className="mt-2 text-ink-soft">
            {isFetching ? "Updating…" : `${vendors.length} vendors delivering near you.`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1">
          <div className="flex gap-0.5 rounded-lg bg-bg-raised p-0.5">
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
              searchOpen ? "bg-brand text-white" : "bg-bg-raised text-ink"
            }`}
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="mt-4 flex h-10 items-center gap-2 rounded-[10px] bg-bg-raised px-3">
          <Search size={16} className="shrink-0 text-ink-soft" />
          <input
            autoFocus
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for vendors..."
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

      {items.length === 0 && !isFetching ? (
        <p className="mt-8 text-ink-soft">
          {search
            ? `No vendors found for "${search}"`
            : `No vendors found in ${cityLabel(city)} right now — try another city.`}
        </p>
      ) : (
        <ul
          className={
            grid
              ? "mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              : "mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6"
          }
        >
          {items.map((item) => (
            <VendorListingCard
              key={item.id}
              item={item}
              grid={grid}
              FallbackIcon={Store}
            />
          ))}
        </ul>
      )}
    </div>
  );
}