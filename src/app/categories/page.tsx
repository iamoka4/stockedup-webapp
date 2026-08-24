import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Shop by category — Groceries & foodstuff in ${DEFAULT_CITY}`,
  description: `Browse all foodstuff and grocery categories available for delivery in ${DEFAULT_CITY}.`,
};

export default async function CategoriesPage() {
  const { categories } = await getCategories().catch(() => ({ categories: [] }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group overflow-hidden rounded-2xl border border-line bg-bg-raised"
          >
            <div className="aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <h2 className="font-display font-semibold text-ink">{cat.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
