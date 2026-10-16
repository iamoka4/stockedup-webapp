"use client";

import { useMemo } from "react";
import { ProductRail } from "./ProductRail";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import type { Product } from "@/lib/api/types";

// Same category list the mobile app uses to separate drinks from other items.
const DRINK_CATEGORIES = ["drinks", "water", "soft drinks", "beer & alcohol"];
const isDrink = (p: Product) =>
  DRINK_CATEGORIES.includes((p.category || "").trim().toLowerCase());

// get-products.php returns the vendor's business_type on every product
// (Product.business_type in lib/api/types.ts).
const isRestaurantMeal = (p: Product) =>
  p.business_type === "restaurant" && !isDrink(p);

// Deterministic shuffle (same seed = same order), so the server render and the
// browser agree and there is no hydration mismatch. The order changes when the
// city or the product list changes.
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function RailOrEmpty({
  title,
  titleClassName,
  products,
  rows,
  fetching,
  label,
}: {
  title: string;
  titleClassName?: string;
  products: Product[];
  rows: 1 | 2 | 3;
  fetching: boolean;
  label: string;
}) {
  if (products.length === 0) {
    return (
      <section className="py-8">
        <h2
          className={`mb-4 font-display text-lg font-bold sm:text-xl ${titleClassName ?? "text-ink"}`}
        >
          {title}
        </h2>
        <p className="text-sm text-ink-soft">
          {fetching ? `Loading products for ${label}…` : `No products found in ${label} yet.`}
        </p>
      </section>
    );
  }
  return (
    <ProductRail
      title={title}
      titleClassName={titleClassName}
      products={products}
      rows={rows}
    />
  );
}

/**
 * What Are You Having Today? — meals from onboarded restaurants, for the
 * selected city. Drinks are left out here; they appear under Trending Drinks.
 * Hidden when the city has no restaurant meals.
 */
export function RestaurantMealsSection({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const label = cityLabel(useUiStore((s) => s.city));
  const { products } = useCityFilteredProducts({ initialProducts });
  const meals = useMemo(
    () => seededShuffle(products.filter(isRestaurantMeal), `${label}-meals`),
    [products, label]
  );

  if (meals.length === 0) return null;
  return <ProductRail title="What Are You Having Today?" products={meals} rows={2} />;
}

/**
 * What's Everyone Buying? — the former Popular Demand rail, logic unchanged
 * (mobile's no-history fallback, up to 20). Restaurant meals and drinks can
 * appear here.
 */
export function PopularDemandSection({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const label = cityLabel(useUiStore((s) => s.city));
  const { products, isFetching } = useCityFilteredProducts({ initialProducts });
  const popular = useMemo(
    () => seededShuffle(products, `${label}-popular`).slice(0, 20),
    [products, label]
  );
  return (
    <RailOrEmpty
      title="🔥 What's Everyone Buying?"
      titleClassName="text-orange-600"
      products={popular}
      rows={2}
      fetching={isFetching}
      label={label}
    />
  );
}

/**
 * Trending Drinks, repositioned. Same selection as the mobile app: every drink
 * product in the city (drinks, water, soft drinks, beer & alcohol), restaurant
 * drinks included, shuffled, up to 20. It reads the shared city product list,
 * so it makes no extra request. Hidden when the city has no drinks.
 */
export function TrendingDrinksSection({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const label = cityLabel(useUiStore((s) => s.city));
  const { products } = useCityFilteredProducts({ initialProducts });
  const drinks = useMemo(
    () => seededShuffle(products.filter(isDrink), `${label}-drinks`).slice(0, 20),
    [products, label]
  );

  if (drinks.length === 0) return null;
  return (
    <ProductRail
      title="🥤 Trending Drinks"
      titleClassName="text-sky-500"
      products={drinks}
      rows={2}
    />
  );
}