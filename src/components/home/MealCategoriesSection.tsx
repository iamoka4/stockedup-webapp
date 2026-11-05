"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import {
  mealCategoryMatches,
  pickMealCategoryImage,
} from "@/lib/utils/categoryMatch";
import type { Product } from "@/lib/api/types";

// Loose shape: the API may return category_name or name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MealCategory = Record<string, any>;

export function MealCategoriesSection({
  categories,
  initialProducts,
}: {
  categories: MealCategory[];
  initialProducts: Product[];
}) {
  // Same city-filtered product list the other home rails use.
  const { products } = useCityFilteredProducts({ initialProducts });

  const meals = useMemo(() => {
    const restaurantProducts = products.filter(
      (p) => p.business_type === "restaurant",
    );
    const withImage = restaurantProducts.filter((p) => p.image);

    return (categories ?? [])
      .map((c) => {
        const name: string = c.category_name ?? c.name ?? "Category";
        // The API's own category image is just the uploads folder (no file
        // name), so only use it if it points at a real file.
        const own =
          typeof c.image === "string" && c.image && !c.image.endsWith("/")
            ? c.image
            : null;
        return {
          ...c,
          name,
          hasProducts: restaurantProducts.some((p) =>
            mealCategoryMatches(p.category, name),
          ),
          image: pickMealCategoryImage(name, withImage) ?? own,
        };
      })
      .filter((c) => c.hasProducts);
  }, [categories, products]);

  if (meals.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="mb-4 font-display text-lg font-bold text-ink sm:text-xl">
        Explore Our Meal Categories
      </h2>
      <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {meals.map((c) => (
          <div
            key={c.id}
            className="w-[44vw] max-w-65 shrink-0 snap-start sm:w-56 lg:w-64"
          >
            <Link
              href={`/food?category=${encodeURIComponent(c.name)}`}
              className="group block rounded-2xl border border-line bg-bg-raised p-2.5"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-tint">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-4xl">
                    🍽️
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3 py-2.5">
                  <p className="line-clamp-1 font-body text-[15px] font-bold text-white">
                    {c.name}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}