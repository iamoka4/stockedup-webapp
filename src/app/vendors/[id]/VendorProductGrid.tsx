"use client";

import { ProductCard } from "@/components/ProductCard";
import type { VendorProductSummary, Product } from "@/lib/api/types";

/**
 * get-vendor-details.php returns a lighter product shape (image_url, no
 * stock/description/vendor_id) than get-products.php. Adapt it here rather
 * than changing ProductCard, since the product grid/search pages use the
 * richer shape directly.
 *
 * `price` is already the promo price while a promotion applies, and
 * `original_price` / `promotion` are only present then, so they must be
 * passed through or the card cannot show the discount.
 */
export function VendorProductGrid({
  products,
  vendorId,
}: {
  products: VendorProductSummary[];
  vendorId: number;
}) {
  if (products.length === 0) {
    return <p className="text-ink-soft">This vendor hasn&apos;t listed any products yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => {
        const adapted: Product = {
          id: p.id,
          name: p.name,
          description: "",
          price: p.price,
          original_price: p.original_price ?? null,
          promotion: p.promotion ?? null,
          unit: p.unit,
          category: p.category,
          stock: 1, // vendor-details doesn't return stock; treat as available
          image: p.image_url,
          vendor_id: vendorId,
        };
        return <ProductCard key={p.id} product={adapted} />;
      })}
    </div>
  );
}