"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "https://api.stockedup.africa/backend/api";

export function PromoRedirect({
  productId,
  pc,
  u,
  s,
}: {
  productId: string;
  pc: string;
  u: string;
  s: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (pc && u && s) {
      try {
        // Best effort: a tracking problem must never get in the customer's way.
        fetch(
          `${API_BASE}/promo-click.php?pc=${pc}&u=${u}&s=${encodeURIComponent(s)}`,
          { keepalive: true, cache: "no-store" },
        ).catch(() => {});
      } catch {
        // ignore
      }
    }
    router.replace(`/products/${productId}`);
  }, [productId, pc, u, s, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-soft">
      Opening product…
    </div>
  );
}