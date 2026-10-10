import type { Metadata } from "next";
import Link from "next/link";
import {
  searchProducts,
  MIN_SEARCH_LENGTH,
  type SearchProduct,
} from "@/lib/api/products";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchCitySync } from "@/components/search/SearchCitySync";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { DEFAULT_CITY } from "@/lib/config";
import { cityLabel } from "@/lib/cities";

export const metadata: Metadata = { title: "Search" };

type SP = { q?: string | string[]; city?: string | string[] };

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

function Section({ title, items }: { title: string; items: SearchProduct[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink">
        {title} <span className="text-sm font-normal text-ink-soft">({items.length})</span>
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((p) => (
          <SearchResultCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP;
}) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const city = first(sp.city).trim() || DEFAULT_CITY;
  const cityName = cityLabel(city);

  const tooShort = q.length < MIN_SEARCH_LENGTH;

  let results: SearchProduct[] = [];
  let failed = false;
  if (!tooShort) {
    try {
      results = await searchProducts(q, city);
    } catch (err) {
      console.error("[search] searchProducts failed:", err);
      failed = true;
    }
  }

  // Restaurant meals vs groceries/supermarket items. The server already
  // ranks by relevance (in-stock first), so order is kept inside each group.
  const meals = results.filter((p) => p.business_type === "restaurant");
  const groceries = results.filter((p) => p.business_type !== "restaurant");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SearchCitySync q={q} urlCity={first(sp.city).trim() || undefined} />
      <SearchBar defaultValue={q} city={first(sp.city).trim() || undefined} />

      {tooShort ? (
        <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            What are you looking for?
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Search meals, groceries, supermarket items and vendors
            {q.length > 0 ? ` — type at least ${MIN_SEARCH_LENGTH} characters.` : "."}
          </p>
        </div>
      ) : failed ? (
        <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Couldn&apos;t load results
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Check your connection and try again.
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Retry
          </Link>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">No results found</p>
          <p className="mt-1 text-sm text-ink-soft">
            We couldn&apos;t find any meals or products matching &ldquo;{q}&rdquo; in {cityName}.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-soft">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo; in{" "}
            {cityName}
          </p>
          <Section title="Restaurant Meals" items={meals} />
          <Section title="Groceries & Supermarket Products" items={groceries} />
        </>
      )}
    </div>
  );
}