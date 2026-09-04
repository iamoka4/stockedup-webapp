"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export function TrackProductView({ productId }: { productId: number }) {
  const addToBrowsingHistory = useUiStore((s) => s.addToBrowsingHistory);

  useEffect(() => {
    addToBrowsingHistory(productId);
  }, [productId, addToBrowsingHistory]);

  return null;
}