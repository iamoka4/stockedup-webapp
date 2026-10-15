"use client";
// src/app/products/[id]/TrackProductView.tsx

import { useEffect, useRef } from "react";
import { useUiStore } from "@/store/uiStore";
// TODO: point this at the web analytics helper (the app uses Analytics.trackEvent).
import { trackEvent } from "@/lib/analytics";

interface Props {
  productId: number;
  name: string;
  price: number;
  category: string;
  vendorName: string;
}

export function TrackProductView({
  productId,
  name,
  price,
  category,
  vendorName,
}: Props) {
  const addToBrowsingHistory = useUiStore((s) => s.addToBrowsingHistory);
  const viewedRef = useRef<number | null>(null);

  // Browsing history: once per product.
  useEffect(() => {
    addToBrowsingHistory(productId);
  }, [productId, addToBrowsingHistory]);

  // product_viewed: exactly once per product view, same payload as the app.
  // The ref guard also stops React Strict Mode (dev) from sending it twice.
  useEffect(() => {
    if (viewedRef.current === productId) return;
    viewedRef.current = productId;
    trackEvent("product_viewed", {
      product_id: String(productId),
      name,
      price,
      category,
      vendor_name: vendorName || "unknown",
    });
  }, [productId, name, price, category, vendorName]);

  return null;
}