import type { Product, Vendor } from "@/lib/api/types";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

export type BizKind = "restaurant" | "supermarket" | "grocery";
export type Tab = "all" | BizKind | "product";

// One shape for every kind of business, whichever endpoint it came from.
export type Biz = {
  key: string;
  id: number;
  kind: BizKind;
  name: string;
  image: string | null;
  open: boolean | null; // null = unknown (grocery endpoint has no status)
  rating: number | null;
  fee: number | null;
  distanceKm: number | null;
};

export type Row = {
  b: Biz;
  categories: string[];
  sells: string[];
  // The business itself matched the search (name or type), not just something it sells.
  bizHit: boolean;
};

export type Data = {
  biz: Biz[];
  // null = still loading in the background
  products: Product[] | null;
  // Businesses in the city that are outside their delivery range from here.
  hidden: number;
};

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// Vendors type their city as free text, so compare ignoring case, spaces
// and punctuation ("Port Harcourt" == "portharcourt").
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/* ───────── Search helpers ───────── */

const clean = (s: string) => s.toLowerCase().replace(/['’]/g, "");

const STOPWORDS = new Set([
  "and", "with", "the", "a", "an", "of", "for", "in", "near", "me", "my", "at", "on", "to",
]);

// Light singular/plural handling: "tomatoes" -> "tomato", "yams" -> "yam".
function stem(t: string) {
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 4 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s")) return t.slice(0, -1);
  return t;
}

// Splits what the person typed into words to match, plus any business type
// they named ("restaurant", "supermarket", "grocery store", ...).
function parseQuery(raw: string): { tokens: string[]; kinds: Set<BizKind> } {
  const kinds = new Set<BizKind>();
  const tokens: string[] = [];
  let genericStore = false;

  for (const w of clean(raw).split(/[^a-z0-9]+/).filter(Boolean)) {
    if (STOPWORDS.has(w)) continue;
    if (w.startsWith("restaurant")) kinds.add("restaurant");
    else if (w.startsWith("supermarket")) kinds.add("supermarket");
    else if (w.startsWith("grocer")) kinds.add("grocery");
    else if (w === "store" || w === "stores" || w === "shop" || w === "shops") {
      genericStore = true;
    } else tokens.push(stem(w));
  }
  // A bare "store" or "shop" means grocery stores and supermarkets.
  if (genericStore && kinds.size === 0) {
    kinds.add("grocery");
    kinds.add("supermarket");
  }
  return { tokens, kinds };
}

const matches = (hay: string, tokens: string[]) =>
  tokens.every((t) => hay.includes(t));

const hayOf = (p: Product) => clean(`${p.name || ""} ${p.category || ""}`);

/* ───────── Data shaping ───────── */

export const fromListing = (v: VendorListingItem, kind: BizKind): Biz => ({
  key: `${kind}-${v.id}`,
  id: v.id,
  kind,
  name: v.shop_name || "",
  image: v.logo || v.cover_image,
  open: v.status === "open",
  rating: v.rating?.average ?? null,
  fee: v.delivery?.estimate ?? null,
  distanceKm: v.distance_km,
});

export const fromGrocery = (v: Vendor): Biz => ({
  key: `grocery-${v.id}`,
  id: v.id,
  kind: "grocery",
  name: v.shop_name || "",
  image: v.image,
  open: null,
  rating: v.average_rating > 0 ? v.average_rating : null,
  fee: null,
  distanceKm: null,
});

export function isOut(p: Product) {
  const n = Number(p.stock);
  return p.stock !== "" && Number.isFinite(n) && n <= 0;
}

// Closed last, then nearest (when we know distance), then best rated.
function sortRows(a: Row, b: Row) {
  return (
    Number(a.b.open === false) - Number(b.b.open === false) ||
    (a.b.distanceKm ?? Infinity) - (b.b.distanceKm ?? Infinity) ||
    (b.b.rating ?? 0) - (a.b.rating ?? 0)
  );
}

/* ───────── What the page shows for a given search ───────── */

export function buildView(data: Data, query: string) {
  const { tokens, kinds } = parseQuery(query);
  const active = tokens.length > 0 || kinds.size > 0;
  const productList = data.products ?? [];

  const byVendor = new Map<number, Product[]>();
  const vendorName = new Map<number, string>();
  const kindOf = new Map<number, BizKind>();
  const catCount = new Map<string, number>();
  for (const b of data.biz) {
    vendorName.set(b.id, b.name);
    kindOf.set(b.id, b.kind);
  }
  for (const p of productList) {
    const list = byVendor.get(p.vendor_id) ?? [];
    list.push(p);
    byVendor.set(p.vendor_id, list);
    if (p.category) catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1);
  }

  // Businesses: all of them until someone searches. Then: businesses of a
  // named type, or whose name matches, or that sell something matching.
  const rows = data.biz
    .flatMap((b): Row[] => {
      const items = byVendor.get(b.id) ?? [];
      const categories = Array.from(
        new Set(items.map((p) => p.category).filter(Boolean))
      ).slice(0, 2);

      if (!active) return [{ b, categories, sells: [], bizHit: false }];
      if (kinds.size > 0 && !kinds.has(b.kind)) return [];
      if (tokens.length === 0) {
        return [{ b, categories, sells: [], bizHit: true }];
      }

      const nameHit = matches(clean(b.name), tokens);
      const itemHits = items.filter((p) => matches(hayOf(p), tokens));
      if (!nameHit && itemHits.length === 0) return [];

      return [
        {
          b,
          categories,
          sells: nameHit ? [] : itemHits.slice(0, 2).map((p) => p.name),
          bizHit: nameHit,
        },
      ];
    })
    .sort(sortRows);

  // Products and categories exist only while searching.
  const products =
    tokens.length === 0
      ? []
      : productList
          .filter((p) => {
            if (!matches(hayOf(p), tokens)) return false;
            const k = kindOf.get(p.vendor_id);
            return kinds.size === 0 || (k !== undefined && kinds.has(k));
          })
          .sort(
            (a, b) =>
              Number(isOut(a)) - Number(isOut(b)) ||
              (a.name || "").localeCompare(b.name || "")
          );

  const categories =
    tokens.length === 0
      ? []
      : Array.from(catCount.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name)
          .filter((c) => matches(clean(c), tokens))
          .slice(0, 12);

  return {
    active,
    hasTokens: tokens.length > 0,
    restaurants: rows.filter((r) => r.b.kind === "restaurant"),
    supermarkets: rows.filter((r) => r.b.kind === "supermarket"),
    groceries: rows.filter((r) => r.b.kind === "grocery"),
    products,
    vendorName,
    categories,
    // Searching for an item rather than a business: lead with the products.
    productsFirst:
      tokens.length > 0 && products.length > 0 && !rows.some((r) => r.bizHit),
  };
}

export type View = ReturnType<typeof buildView>;