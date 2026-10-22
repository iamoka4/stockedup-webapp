"use client";
// src/app/products/[id]/ProductPurchase.tsx
//
// The product page is rendered on the server, which has no login token, so its
// HTML always carries the visitor's price. This component asks the API again
// from the browser WITH the customer's token, so a promotion made for
// "Specific customers" shows (struck-through original price + promo price) for
// the customers it is meant for. The cart and checkout re-price on the server
// anyway, so this is display only.

import { useEffect, useState, type ReactNode } from "react";
import { apiGet } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import type { AddonGroup } from "@/lib/api/types";
import { AddToCartPanel } from "./AddToCartPanel";

type PersonalProduct = {
  price: number | string;
  original_price?: number | string | null;
};

interface Props {
  productId: number;
  name: string;
  inStock: boolean;
  unit: string;
  /** Price from the server render (what a visitor pays). */
  basePrice: number;
  /** Normal price from the server render, when a public promotion applies. */
  baseOriginalPrice?: number | null;
  stock: number;
  addonGroups: AddonGroup[];
  /** Rendered between the price and the add-to-cart panel (the description). */
  children?: ReactNode;
}

export function ProductPurchase({
  productId,
  name,
  inStock,
  unit,
  basePrice,
  baseOriginalPrice = null,
  stock,
  addonGroups,
  children,
}: Props) {
  const [price, setPrice] = useState<number>(basePrice);
  const [originalPrice, setOriginalPrice] = useState<number | null>(baseOriginalPrice);

  useEffect(() => {
    // Visitors already have the right price from the server render.
    if (!tokenStore.getAccessToken()) return undefined;

    let cancelled = false;
    apiGet<{ product?: PersonalProduct }>("/get-product.php", { id: productId })
      .then((d) => {
        const p = d?.product;
        if (cancelled || !p) return;
        const livePrice = Number(p.price);
        if (!Number.isFinite(livePrice) || livePrice <= 0) return;
        const orig = p.original_price != null ? Number(p.original_price) : null;
        setPrice(livePrice);
        setOriginalPrice(orig !== null && Number.isFinite(orig) ? orig : null);
      })
      .catch(() => {
        // Keep the server price if this fails: the cart re-prices anyway.
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const hasPromo = originalPrice !== null && originalPrice > price;
  const discountPct = hasPromo
    ? Math.round((1 - price / (originalPrice as number)) * 100)
    : 0;

  return (
    <>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {hasPromo && (
          <span className="tabular font-display text-xl text-ink-soft line-through">
            ₦{(originalPrice as number).toLocaleString()}
          </span>
        )}
        <span className="tabular font-display text-3xl font-semibold text-ink">
          ₦{price.toLocaleString()}
        </span>
        <span className="font-body text-sm font-normal text-ink-soft">/ {unit}</span>
        {hasPromo && discountPct > 0 && (
          <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}
      </div>

      {children}

      <AddToCartPanel
        productId={productId}
        name={name}
        inStock={inStock}
        price={price}
        stock={stock}
        addonGroups={addonGroups}
      />
    </>
  );
}