import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { getProduct } from "@/lib/api/products";
import { StampBadge } from "@/components/StampBadge";
import { AddToCartPanel } from "./AddToCartPanel";
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

          <div className="mt-3 flex items-center gap-2">
            {review_stats.total > 0 && (
              <StampBadge tone="brand">
                <Star size={11} fill="currentColor" strokeWidth={0} />
                {review_stats.avg_rating} ({review_stats.total})
              </StampBadge>
            )}
            <StampBadge tone={product.in_stock ? "leaf" : "clay"}>
              {product.in_stock ? "In stock" : "Out of stock"}
            </StampBadge>
          </div>

          <p className="tabular mt-5 font-display text-3xl font-semibold text-ink">
            ₦{product.price.toLocaleString()}
            <span className="ml-1 font-body text-sm font-normal text-ink-soft">
              / {product.unit}
            </span>
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>
          )}

          <AddToCartPanel productId={product.id} inStock={product.in_stock} />
           <TrackProductView productId={product.id} />
        </div>
      </div>

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
                <p className="tabular text-sm text-ink-soft">₦{r.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
