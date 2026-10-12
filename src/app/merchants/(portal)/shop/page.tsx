"use client";

import { useEffect, useState } from "react";
import { getShopProfile, type ShopProfile } from "@/lib/api/vendor";
import { getVendorProducts, type VendorProduct } from "@/lib/api/vendor-products";
import { ShopCard } from "@/components/vendor/ShopCard";
import { ShopProducts } from "@/components/vendor/ShopProducts";
import { ErrorBanner, errorMessage } from "@/components/vendor/ui";

export default function ShopPage() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [products, setProducts] = useState<VendorProduct[] | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getShopProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((err) => {
        if (!cancelled) setProfileError(errorMessage(err));
      });

    // Loaded separately so a products failure never hides the shop card.
    getVendorProducts()
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err) => {
        if (!cancelled) setProductsError(errorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-28 pt-6">
      <ErrorBanner message={profileError} />

      {profile ? (
        <ShopCard profile={profile} href="/merchants/shop-profile" />
      ) : (
        !profileError && <p className="text-ink-soft">Loading shop…</p>
      )}

      {/* addHref / viewAllHref: set these to the product pages once they exist. */}
      <ShopProducts products={products} error={productsError} />
    </div>
  );
}