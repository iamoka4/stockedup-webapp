"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bike,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  Star,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { SUPPORTED_CITIES, cityLabel } from "@/lib/cities";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";
import {
  getRestaurants,
  getSupermarkets,
  type VendorListingItem,
} from "@/lib/api/vendor-listing";
import {
  GeoError,
  getPermissionState,
  getPosition,
  type Coords,
} from "@/lib/location/geolocation";

type Phase =
  | "checking"
  | "prompt"
  | "locating"
  | "denied"
  | "unavailable"
  | "unsupported"
  | "loading"
  | "error"
  | "ready";

type Kind = "restaurant" | "store";
type Row = {
  kind: Kind;
  v: VendorListingItem;
  categories: string[];
  sells: string[];
};
type Data = {
  restaurants: VendorListingItem[];
  stores: VendorListingItem[];
  products: Product[];
  // Businesses in the city that are outside their delivery range from here.
  hidden: number;
};

const PRIMARY =
  "cursor-pointer rounded-full bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-deep";
const SECONDARY =
  "cursor-pointer rounded-full border border-line px-6 py-3 font-bold text-ink transition hover:border-brand";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// Vendors type their city as free text, so compare ignoring case, spaces
// and punctuation ("Port Harcourt" == "portharcourt").
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="size-9 animate-spin rounded-full border-4 border-brand/25 border-t-brand" />
      <p className="text-ink-soft">{label}</p>
    </div>
  );
}

function Notice({
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
    <div className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
      <span className="grid size-16 place-items-center rounded-full bg-brand-tint text-brand">
        {icon}
      </span>
      <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-ink-soft">{text}</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">{children}</div>
    </div>
  );
}

function ResultRow({ r }: { r: Row }) {
  const v = r.v;
  const open = v.status === "open";
  const Fallback = r.kind === "restaurant" ? UtensilsCrossed : Store;
  const img = v.logo || v.cover_image;
  const rating = v.rating?.average ?? null;
  const fee = v.delivery?.estimate ?? null;
  const pill =
    "flex items-center gap-1 rounded-lg bg-bg-raised px-2 py-1 text-ink";

  return (
    <li>
      <Link
        href={`/vendors/${v.id}`}
        className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-3 transition hover:border-brand"
      >
        <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-brand">
              <Fallback size={22} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-bold">{v.shop_name}</h4>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white ${
                open ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {open ? "OPEN" : "CLOSED"}
            </span>
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
            <span className={`tabular ${pill}`}>
              <Star size={10} />
              {rating !== null ? rating.toFixed(1) : "0.0"}
            </span>
            {fee !== null && (
              <span className={`tabular ${pill}`}>
                <Bike size={11} />
                {/* Without a distance the API only knows the base fee. */}
                {v.distance_km === null ? "from " : ""}
                {naira(fee)}
              </span>
            )}
            {v.distance_km !== null && (
              <span className={`tabular ${pill}`}>
                <Navigation size={11} />
                {v.distance_km.toFixed(1)} km
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

// Open businesses first, then nearest (when we know distance), then best rated.
function byOpenNearestRated(a: Row, b: Row) {
  return (
    Number(b.v.status === "open") - Number(a.v.status === "open") ||
    (a.v.distance_km ?? Infinity) - (b.v.distance_km ?? Infinity) ||
    (b.v.rating?.average ?? 0) - (a.v.rating?.average ?? 0)
  );
}

function NearbySheet({ onClose }: { onClose: () => void }) {
  // Same city the header's LocationDropdown uses, so they always agree.
  const city = useUiStore((s) => s.city);
  const setCity = useUiStore((s) => s.setCity);
  const cityName = cityLabel(city);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const cityRef = useRef(city);
  const requestId = useRef(0);
  const lastLoad = useRef<{ city: string; coords?: Coords }>({ city });

  const [phase, setPhase] = useState<Phase>("checking");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [query, setQuery] = useState("");
  const [stillBlocked, setStillBlocked] = useState(false);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  // Native modal dialog: focus trap, Esc to close, and top-layer stacking.
  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const load = useCallback(async (forCity: string, c?: Coords) => {
    const id = ++requestId.current;
    lastLoad.current = { city: forCity, coords: c };
    setCoords(c ?? null);
    setPhase("loading");

    // The API compares against vendors' free-text city (e.g. "Port Harcourt"),
    // so try the readable label first, then the stored value.
    const names = Array.from(new Set([cityLabel(forCity), forCity]));
    let r: VendorListingItem[] | null = null;
    let s: VendorListingItem[] | null = null;
    let p: Product[] = [];
    for (const name of names) {
      [r, s, p] = await Promise.all([
        getRestaurants(name, c).catch(() => null),
        getSupermarkets(name, c).catch(() => null),
        getProducts({ city: name }).catch(() => [] as Product[]),
      ]);
      if ((r?.length ?? 0) + (s?.length ?? 0) > 0) break;
    }
    if (id !== requestId.current) return; // a newer request replaced this one

    if (!r && !s) {
      setPhase("error");
      return;
    }

    // The server already scopes by city. As a safety net, never list a
    // business that says it's in a different one.
    const inCity = (v: VendorListingItem) =>
      !v.city || norm(v.city) === norm(forCity);
    // With a customer location, the backend says whether each business's
    // city delivers that far. Hide the ones that say no; null means "can't
    // tell", so those stay visible.
    const inRange = (v: VendorListingItem) => v.delivery?.delivers_here !== false;

    const restaurantsAll = (r ?? []).filter(inCity);
    const storesAll = (s ?? []).filter(inCity);
    const restaurants = restaurantsAll.filter(inRange);
    const stores = storesAll.filter(inRange);

    setData({
      restaurants,
      stores,
      products: p,
      hidden:
        restaurantsAll.length +
        storesAll.length -
        restaurants.length -
        stores.length,
    });
    setPhase("ready");
  }, []);

  // Asks for the device location (this is what triggers the browser prompt
  // when permission hasn't been decided). Coordinates feed distance, delivery
  // estimates and the delivery-range check; the city comes from the shared
  // city store.
  const locate = useCallback(async () => {
    setPhase("locating");
    setStillBlocked(false);

    let c: Coords;
    try {
      c = await getPosition();
    } catch (e) {
      const kind = e instanceof GeoError ? e.kind : "unavailable";
      setPhase(
        kind === "denied"
          ? "denied"
          : kind === "unsupported"
            ? "unsupported"
            : "unavailable"
      );
      return;
    }
    await load(cityRef.current, c);
  }, [load]);

  // Used by "Try again" and "Use my location". Never calls the browser
  // prompt while permission is blocked, since browsers ignore it anyway.
  const retryLocation = useCallback(async () => {
    const perm = await getPermissionState();
    if (perm === "denied") {
      setStillBlocked(true);
      setPhase("denied");
      return;
    }
    if (perm === "unsupported") {
      setPhase("unsupported");
      return;
    }
    locate();
  }, [locate]);

  // On open: read the permission first, without prompting.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const perm = await getPermissionState();
      if (cancelled) return;
      if (perm === "granted") locate();
      else if (perm === "denied") setPhase("denied");
      else if (perm === "unsupported") setPhase("unsupported");
      else setPhase("prompt");
    })();
    return () => {
      cancelled = true;
    };
  }, [locate]);

  const browseCity = () => load(cityRef.current);

  const changeCity = (value: string) => {
    setCity(value);
    load(value, coords ?? undefined);
  };

  const q = query.trim().toLowerCase();

  const { groups, suggestions, total } = useMemo(() => {
    const empty = {
      groups: [] as { title: string; rows: Row[] }[],
      suggestions: [] as string[],
      total: 0,
    };
    if (!data) return empty;

    const byVendor = new Map<number, Product[]>();
    const catCount = new Map<string, number>();
    for (const p of data.products) {
      const list = byVendor.get(p.vendor_id) ?? [];
      list.push(p);
      byVendor.set(p.vendor_id, list);
      if (p.category) catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1);
    }
    const suggestions = Array.from(catCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([c]) => c);

    const build = (list: VendorListingItem[], kind: Kind): Row[] =>
      list
        .flatMap((v): Row[] => {
          const items = byVendor.get(v.id) ?? [];
          const categories = Array.from(
            new Set(items.map((p) => p.category).filter(Boolean))
          ).slice(0, 2);

          if (!q) return [{ kind, v, categories, sells: [] }];

          const nameHit = (v.shop_name || "").toLowerCase().includes(q);
          const itemHits = items.filter((p) =>
            (p.name || "").toLowerCase().includes(q)
          );
          const catHit = items.some((p) =>
            (p.category || "").toLowerCase().includes(q)
          );
          if (!nameHit && itemHits.length === 0 && !catHit) return [];

          return [
            {
              kind,
              v,
              categories,
              sells: nameHit ? [] : itemHits.slice(0, 2).map((p) => p.name),
            },
          ];
        })
        .sort(byOpenNearestRated);

    const groups = [
      { title: "Restaurants", rows: build(data.restaurants, "restaurant") },
      { title: "Stores & supermarkets", rows: build(data.stores, "store") },
    ].filter((g) => g.rows.length > 0);

    return {
      groups,
      suggestions,
      total: groups.reduce((n, g) => n + g.rows.length, 0),
    };
  }, [data, q]);

  const browseLabel = `Browse ${cityName} instead`;
  const ready = phase === "ready";
  const nothingDelivers = ready && !q && total === 0 && (data?.hidden ?? 0) > 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="explore-title"
      className="m-0 size-full max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/50"
    >
      <div
        className="flex size-full items-end justify-center sm:items-center sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`flex w-full flex-col overflow-hidden rounded-t-3xl bg-bg-raised text-ink shadow-2xl sm:max-w-xl sm:rounded-3xl ${
            ready ? "h-[85dvh] sm:h-[36rem]" : "max-h-[88dvh]"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 id="explore-title" className="font-display text-lg font-bold">
              Explore nearby
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 cursor-pointer place-items-center rounded-full bg-bg text-ink"
            >
              <X size={18} />
            </button>
          </div>

          {(phase === "checking" || phase === "locating") && (
            <Spinner label="Finding your location…" />
          )}
          {phase === "loading" && (
            <Spinner label="Finding businesses near you…" />
          )}

          {phase === "prompt" && (
            <Notice
              icon={<LocateFixed size={30} />}
              title="Find restaurants & stores near you"
              text="Turn on your location to discover restaurants and stores available in your area."
            >
              <button type="button" onClick={locate} className={PRIMARY}>
                Enable Location
              </button>
              <button type="button" onClick={onClose} className={SECONDARY}>
                Not Now
              </button>
            </Notice>
          )}

          {phase === "denied" && (
            <Notice
              icon={<LocateFixed size={30} />}
              title="Location access is blocked"
              text="Your browser is blocking location for StockedUp, so we can't ask again. Tap the lock icon next to the web address, open Site settings, set Location to Allow, then try again."
            >
              {stillBlocked && (
                <p className="text-sm font-semibold text-red-500">
                  Location is still blocked.
                </p>
              )}
              <button type="button" onClick={retryLocation} className={PRIMARY}>
                Try again
              </button>
              <button type="button" onClick={browseCity} className={SECONDARY}>
                {browseLabel}
              </button>
            </Notice>
          )}

          {phase === "unavailable" && (
            <Notice
              icon={<LocateFixed size={30} />}
              title="Can't find your location"
              text="Location may be turned off on your device, or your signal is weak. Turn on Location (GPS) in your phone or computer settings, then try again."
            >
              <button type="button" onClick={retryLocation} className={PRIMARY}>
                Try again
              </button>
              <button type="button" onClick={browseCity} className={SECONDARY}>
                {browseLabel}
              </button>
            </Notice>
          )}

          {phase === "unsupported" && (
            <Notice
              icon={<LocateFixed size={30} />}
              title="Location isn't available here"
              text={`This browser can't share your location. You can still look at what's available in ${cityName}.`}
            >
              <button type="button" onClick={browseCity} className={PRIMARY}>
                {`Browse ${cityName}`}
              </button>
            </Notice>
          )}

          {phase === "error" && (
            <Notice
              icon={<Search size={30} />}
              title="Couldn't load businesses"
              text="Check your connection and try again."
            >
              <button
                type="button"
                onClick={() => load(lastLoad.current.city, lastLoad.current.coords)}
                className={PRIMARY}
              >
                Try again
              </button>
            </Notice>
          )}

          {ready && (
            <>
              <div className="shrink-0 space-y-3 border-b border-line px-5 py-3">
                <label className="flex h-11 items-center gap-2 rounded-xl bg-bg px-3">
                  <Search size={16} className="shrink-0 text-ink-soft" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus={
                      typeof window !== "undefined" &&
                      window.matchMedia("(pointer: fine)").matches
                    }
                    placeholder="Search restaurants, stores, food or categories"
                    aria-label="Search restaurants, stores, food or categories"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="cursor-pointer text-ink-soft"
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>

                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                  <label className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-brand" />
                    <span>Delivering to</span>
                    <select
                      value={city}
                      onChange={(e) => changeCity(e.target.value)}
                      aria-label="Delivery city"
                      className="cursor-pointer bg-transparent font-semibold text-ink outline-none"
                    >
                      {SUPPORTED_CITIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {coords ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <LocateFixed size={12} />
                      Using your location
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={retryLocation}
                      className="cursor-pointer font-semibold text-brand-deep hover:underline"
                    >
                      Use my location
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {!q && suggestions.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Popular categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setQuery(s)}
                          className="cursor-pointer rounded-full border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-brand"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {total === 0 ? (
                  nothingDelivers ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <p className="font-bold">
                        Nothing delivers to your location yet
                      </p>
                      <p className="mt-1 max-w-xs text-sm text-ink-soft">
                        {`${data?.hidden} business${data?.hidden === 1 ? "" : "es"} in ${cityName} ${
                          data?.hidden === 1 ? "is" : "are"
                        } outside their delivery range from where you are.`}
                      </p>
                      <button
                        type="button"
                        onClick={browseCity}
                        className={`${SECONDARY} mt-5`}
                      >
                        {`See everything in ${cityName}`}
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="font-bold">
                        {q
                          ? `No results for “${query.trim()}”`
                          : `Nothing in ${cityName} yet`}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {q
                          ? "Try a different name, dish or category."
                          : "Check back soon as more businesses join."}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-6">
                    {groups.map((g) => (
                      <section key={g.title}>
                        <h3 className="mb-3 font-display text-base font-bold text-brand-deep">
                          {g.title}{" "}
                          <span className="font-sans text-sm font-semibold text-ink-soft">
                            ({g.rows.length})
                          </span>
                        </h3>
                        <ul className="space-y-2.5">
                          {g.rows.map((r) => (
                            <ResultRow key={`${r.kind}-${r.v.id}`} r={r} />
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

const DEFAULT_BUTTON =
  "inline-flex cursor-pointer rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep";

export function ExploreNearbyButton({
  className = DEFAULT_BUTTON,
  children = "Explore restaurants & stores",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      {open && <NearbySheet onClose={() => setOpen(false)} />}
    </>
  );
}