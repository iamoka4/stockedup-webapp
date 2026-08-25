import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { CategoryProductGrid } from "./CategoryProductGrid";
import { DEFAULT_CITY } from "@/lib/config";
import { slugify } from "@/lib/utils/slug";
import type { Category } from "@/lib/api/types";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

// Accepts either a slug ("grains") or, for backward compatibility with any
// existing links/bookmarks, a raw numeric id ("1").
async function resolveCategory(slugOrId: string): Promise<Category | null> {
  const { categories } = await getCategories().catch(() => ({ categories: [] }));
  return (
    categories.find((c) => slugify(c.name) === slugOrId) ??
    categories.find((c) => String(c.id) === slugOrId) ??
    null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await resolveCategory(id);
  const label = category?.name ?? "Category";
  return {
    title: `${label} — Buy online in ${DEFAULT_CITY}`,
    description: `Shop ${label.toLowerCase()} online in ${DEFAULT_CITY}. Delivered fast from local vendors.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { id } = await params;
  const category = await resolveCategory(id);

  if (!category) {
    notFound();
  }

  const products = await getProducts({ category: category.name, city: DEFAULT_CITY }).catch(
    () => []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">{category.name}</h1>
      <CategoryProductGrid categoryName={category.name} initialProducts={products} />
    </div>
  );
}