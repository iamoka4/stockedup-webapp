import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { getProduct } from "@/lib/api/products";
// TODO: use the file that actually exports getCategories (the one you pasted).
import { getCategories } from "@/lib/api/categories";
import { StampBadge } from "@/components/StampBadge";
import { ProductPurchase } from "./ProductPurchase";
import { RelatedProducts } from "./RelatedProducts";
import { Suspense } from "react";
import { DEFAULT_CITY } from "@/lib/config";
import { TrackProductView } from "./TrackProductView";
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchProduct(id: string) {
  const productId = Number(id);
  if (!Number.isFinite(productId) || productId <= 0) return null;
  try {
    return await getProduct(productId);
  } catch (err) {
    console.error(`[product ${id}] fetchProduct failed:`, err);
    return null;
  }
}

// The product stores its category as an id; analytics (like the app) wants
// the readable name. Falls back to the raw value if categories can't load.
async function resolveCategoryName(raw: string): Promise<string> {
  if (!raw) return "";
  try {
    // getCategories() resolves to { categories: Category[] }
    const { categories } = await getCategories();
    const match = (categories as any[]).find((c) => String(c.id) === String(raw));
    return match?.name ?? match?.category_name ?? String(raw);
  } catch {
    return String(raw);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchProduct(id);
  if (!data) return { title: "Product not found" };

  const { product } = data;
  const title = `${product.name} — ₦${product.price.toLocaleString()} | Buy in ${DEFAULT_CITY}`;
  return {
    title,
    description:
      product.description ||
      `Buy ${product.name} online in ${DEFAULT_CITY} from ${product.vendor.name}. Fast delivery, pay on Paystack.`,
    openGraph: { title, images: product.image ? [product.image] : undefined },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchProduct(id);
  if (!data) notFound();

  const { product, review_stats, related_products } = data;

  // Backend may send stock as a string ("12"), so normalize it.
  const stockCount = Number(product.stock ?? 0) || 0;
  const lowStock = product.in_stock && stockCount > 0 && stockCount <= 10;

  const categoryName = await resolveCategoryName(String(product.category ?? ""));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-brand-tint">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <Link
            href={`/vendors/${product.vendor.id}`}
            className="text-sm font-medium text-brand-deep hover:underline"
          >
            {product.vendor.name}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {review_stats.total > 0 && (
              <StampBadge tone="brand">
                <Star size={11} fill="currentColor" strokeWidth={0} />
                {review_stats.avg_rating} ({review_stats.total})
              </StampBadge>
            )}
            <StampBadge tone={product.in_stock ? "leaf" : "clay"}>
              {product.in_stock ? "In stock" : "Out of stock"}
            </StampBadge>
            {lowStock && <StampBadge tone="clay">Only {stockCount} left</StampBadge>}
          </div>

          {/* Price, description and add-to-cart. The price is re-fetched in the
              browser for logged-in customers so promotions made for specific
              customers show up for them (the server render can't see the login). */}
          <ProductPurchase
            key={product.id}
            productId={product.id}
            name={product.name}
            inStock={product.in_stock}
            unit={product.unit}
            basePrice={product.price}
            baseOriginalPrice={product.original_price ?? null}
            stock={stockCount}
            addonGroups={product.addon_groups ?? []}
          >
            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>
            )}
          </ProductPurchase>

          <TrackProductView
            productId={product.id}
            name={product.name}
            price={Number(product.price)}
            category={categoryName}
            vendorName={product.vendor.name}
          />
        </div>
      </div>

      {/* Goes well with this — hidden while a cart line is being edited.
          Suspense is required because it reads ?editCartId via useSearchParams. */}
      <Suspense fallback={null}>
        <RelatedProducts productId={product.id} showSimilar={false} />
      </Suspense>

      {related_products.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {related_products.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.id}`}
                className="rounded-2xl border border-line bg-bg-raised p-3"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-brand-tint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">{r.name}</p>
                <p className="tabular text-sm text-ink-soft">
                  ₦{r.price.toLocaleString()}
                  {r.original_price ? (
                    <span className="ml-1 text-xs line-through opacity-60">
                      ₦{r.original_price.toLocaleString()}
                    </span>
                  ) : null}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}