"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { SUPPORTED_CITIES, cityLabel } from "@/lib/cities";
import { getProducts } from "@/lib/api/products";
import { getVendors } from "@/lib/api/vendors";
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
import {
  buildView,
  fromGrocery,
  fromListing,
  norm,
  type Data,
  type Tab,
} from "@/lib/explore/search";
import {
  BizCard,
  Notice,
  PRIMARY,
  ProductCard,
  SECONDARY,
  Section,
  Spinner,
} from "./ExploreParts";

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

const TABS: [Tab, string][] = [
  ["all", "All"],
  ["restaurant", "Restaurants"],
  ["supermarket", "Supermarkets"],
  ["grocery", "Grocery stores"],
  ["product", "Products"],
];

const BIZ_GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
const PRODUCT_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

export function ExplorePage() {
  // Same city the header's LocationDropdown uses, so they always agree.
  const city = useUiStore((s) => s.city);
  const setCity = useUiStore((s) => s.setCity);
  const cityName = cityLabel(city);

  const cityRef = useRef(city);
  const requestId = useRef(0);
  const lastLoad = useRef<{ city: string; coords?: Coords }>({ city });

  const [phase, setPhase] = useState<Phase>("checking");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [query, setQuery] = useState("");
  const [rawTab, setTab] = useState<Tab>("all");
  const [stillBlocked, setStillBlocked] = useState(false);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  const load = useCallback(async (forCity: string, c?: Coords) => {
    const id = ++requestId.current;
    lastLoad.current = { city: forCity, coords: c };
    setCoords(c ?? null);
    setPhase("loading");

    // Grocery stores come from their own endpoint, which returns every city.
    const grocery = await getVendors()
      .then((res) => res.vendors ?? [])
      .catch(() => null);

    // The restaurant/supermarket endpoints compare against vendors'
    // free-text city (e.g. "Port Harcourt"), so try the readable label
    // first, then the stored value.
    const names = Array.from(new Set([cityLabel(forCity), forCity]));
    let r: VendorListingItem[] | null = null;
    let s: VendorListingItem[] | null = null;
    let usedName = names[0];
    for (const name of names) {
      usedName = name;
      [r, s] = await Promise.all([
        getRestaurants(name, c).catch(() => null),
        getSupermarkets(name, c).catch(() => null),
      ]);
      if ((r?.length ?? 0) + (s?.length ?? 0) > 0) break;
    }
    if (id !== requestId.current) return; // a newer request replaced this one

    if (!r && !s && !grocery) {
      setPhase("error");
      return;
    }

    // The servers already scope by city where they can. As a safety net,
    // never list a business that says it's in a different one.
    const inCity = (vendorCity: string | null) =>
      !vendorCity || norm(vendorCity) === norm(forCity);
    // With a customer location, the backend says whether each restaurant or
    // supermarket's city delivers that far. Hide the ones that say no; null
    // means "can't tell", so those stay visible.
    const inRange = (v: VendorListingItem) => v.delivery?.delivers_here !== false;

    const restaurantsAll = (r ?? []).filter((v) => inCity(v.city));
    const supermarketsAll = (s ?? []).filter((v) => inCity(v.city));
    const restaurants = restaurantsAll.filter(inRange);
    const supermarkets = supermarketsAll.filter(inRange);
    const groceries = (grocery ?? []).filter((v) => inCity(v.city));

    const biz = [
      ...restaurants.map((v) => fromListing(v, "restaurant")),
      ...supermarkets.map((v) => fromListing(v, "supermarket")),
      ...groceries.map(fromGrocery),
    ].filter((b) => b.name);

    // Show the businesses right away; products only matter once someone
    // searches, so they load in the background.
    setData({
      biz,
      products: null,
      hidden:
        restaurantsAll.length +
        supermarketsAll.length -
        restaurants.length -
        supermarkets.length,
    });
    setPhase("ready");

    const order = [usedName, ...names.filter((n) => n !== usedName)];
    let p: Product[] = [];
    for (const name of order) {
      p = await getProducts({ city: name }).catch(() => [] as Product[]);
      if (p.length > 0) break;
    }
    if (id !== requestId.current) return;

    // Only products from businesses the person can actually order from.
    const visible = new Set(biz.map((b) => b.id));
    setData((d) =>
      d ? { ...d, products: p.filter((x) => visible.has(x.vendor_id)) } : d
    );
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

  const view = useMemo(
    () => (data ? buildView(data, query) : null),
    [data, query]
  );

  const browseLabel = `Browse ${cityName} instead`;
  const ready = phase === "ready" && view !== null;
  const active = view?.active ?? false;
  const loadingProducts =
    ready && (view?.hasTokens ?? false) && data?.products === null;

  // The Products tab only exists while searching.
  const tabs = TABS.filter(([value]) => value !== "product" || active);
  const tab: Tab = rawTab === "product" && !active ? "all" : rawTab;

  const counts: Record<Tab, number> = {
    all: 0,
    restaurant: view?.restaurants.length ?? 0,
    supermarket: view?.supermarkets.length ?? 0,
    grocery: view?.groceries.length ?? 0,
    product: active ? (view?.products.length ?? 0) : 0,
  };
  counts.all =
    counts.restaurant + counts.supermarket + counts.grocery + counts.product;

  const show = (t: Tab) => tab === "all" || tab === t;
  const bizInitial = tab === "all" ? 6 : 24;
  const productInitial = tab === "all" ? 8 : 24;
  const q = query.trim();
  const tabLabel = (TABS.find(([v]) => v === tab)?.[1] ?? "").toLowerCase();

  const businessSections = view && (
    <>
      {show("restaurant") && (
        <Section
          key={`restaurants-${q}-${tab}`}
          title="Restaurants"
          items={view.restaurants}
          initial={bizInitial}
          grid={BIZ_GRID}
          keyOf={(r) => r.b.key}
          render={(r) => <BizCard r={r} />}
        />
      )}
      {show("supermarket") && (
        <Section
          key={`supermarkets-${q}-${tab}`}
          title="Supermarkets"
          items={view.supermarkets}
          initial={bizInitial}
          grid={BIZ_GRID}
          keyOf={(r) => r.b.key}
          render={(r) => <BizCard r={r} />}
        />
      )}
      {show("grocery") && (
        <Section
          key={`groceries-${q}-${tab}`}
          title="Grocery stores"
          items={view.groceries}
          initial={bizInitial}
          grid={BIZ_GRID}
          keyOf={(r) => r.b.key}
          render={(r) => <BizCard r={r} />}
        />
      )}
    </>
  );

  const productSection = view && show("product") && (
    <Section
      key={`products-${q}-${tab}`}
      title="Products"
      items={view.products}
      initial={productInitial}
      grid={PRODUCT_GRID}
      keyOf={(p) => String(p.id)}
      render={(p) => (
        <ProductCard p={p} vendor={view.vendorName.get(p.vendor_id) ?? ""} />
      )}
    />
  );

  const nothing = tab === "all" ? counts.all === 0 : counts[tab] === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Explore near you
      </h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        The restaurants, supermarkets and grocery stores that deliver to you.
        Search to find food, groceries or categories.
      </p>

      {(phase === "checking" || phase === "locating") && (
        <Spinner label="Finding your location…" />
      )}
      {phase === "loading" && <Spinner label="Finding businesses near you…" />}

      {phase === "prompt" && (
        <Notice
          icon={<LocateFixed size={30} />}
          title="Find restaurants & stores near you"
          text="Turn on your location to discover restaurants and stores available in your area."
        >
          <button type="button" onClick={locate} className={PRIMARY}>
            Enable Location
          </button>
          <button type="button" onClick={browseCity} className={SECONDARY}>
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

      {ready && view && (
        <>
          <div className="mt-6 space-y-3">
            <label className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-bg-raised px-4 focus-within:border-brand">
              <Search size={18} className="shrink-0 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus={
                  typeof window !== "undefined" &&
                  window.matchMedia("(pointer: fine)").matches
                }
                placeholder="Search businesses, food, groceries or categories"
                aria-label="Search businesses, food, groceries or categories"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-soft/70"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="cursor-pointer text-ink-soft"
                >
                  <X size={18} />
                </button>
              )}
            </label>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-ink-soft">
              <label className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand" />
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
                  <LocateFixed size={14} />
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

            {coords && (data?.hidden ?? 0) > 0 && (
              <p className="text-sm text-ink-soft">
                {`${data?.hidden} more restaurant${data?.hidden === 1 ? "" : "s"} or supermarket${data?.hidden === 1 ? "" : "s"} in ${cityName} ${
                  data?.hidden === 1 ? "doesn't" : "don't"
                } deliver to your location. `}
                <button
                  type="button"
                  onClick={browseCity}
                  className="cursor-pointer font-semibold text-brand-deep hover:underline"
                >
                  Show everything in {cityName}
                </button>
              </p>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Filter results"
            className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {tabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === value
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-bg-raised text-ink hover:border-brand"
                }`}
              >
                {label}{" "}
                <span className={tab === value ? "text-white/80" : "text-ink-soft"}>
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>

          {loadingProducts && (
            <p className="mt-4 text-sm text-ink-soft">Loading products…</p>
          )}

          <div className="mt-8 space-y-10">
            {(tab === "all" || tab === "product") && view.categories.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-xl font-bold text-brand-deep">
                  Matching categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {view.categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setQuery(c)}
                      className="cursor-pointer rounded-full border border-line bg-bg-raised px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:border-brand"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {view.productsFirst ? (
              <>
                {productSection}
                {businessSections}
              </>
            ) : (
              <>
                {businessSections}
                {productSection}
              </>
            )}

            {nothing && !loadingProducts && (
              <div className="py-16 text-center">
                <p className="font-bold">
                  {active
                    ? tab === "all"
                      ? `No results for “${q}”`
                      : `No ${tabLabel} match “${q}”`
                    : tab === "all"
                      ? `Nothing in ${cityName} yet`
                      : `No ${tabLabel} in ${cityName} yet`}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {active
                    ? "Try a different name, dish or category."
                    : "Check back soon as more businesses join."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}