import type { Metadata } from "next";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { CategoryProductGrid } from "./CategoryProductGrid";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchCategoryName(id: string): Promise<string | null> {
  const { categories } = await getCategories().catch(() => ({ categories: [] }));
  const match = categories.find((c) => String(c.id) === id);
  return match?.name ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = await fetchCategoryName(id);
  const label = name ?? "Category";
  return {
    title: `${label} — Buy online in ${DEFAULT_CITY}`,
    description: `Shop ${label.toLowerCase()} online in ${DEFAULT_CITY}. Delivered fast from local vendors.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { id } = await params;
  const name = await fetchCategoryName(id);
  const products = await getProducts({ category: name ?? id, city: DEFAULT_CITY }).catch(
    () => []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">{name ?? "Category"}</h1>
      <CategoryProductGrid categoryName={name ?? id} initialProducts={products} />
    </div>
  );
}