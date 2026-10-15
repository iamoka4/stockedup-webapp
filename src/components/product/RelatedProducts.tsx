"use client";
// src/app/products/[id]/RelatedProducts.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/lib/api/cart";

const API_BASE = "https://api.stockedup.africa";

type Product = {
  id: number;
  vendor_id: number;
  business_type: string;
  name: string;
  price: string | number;
  unit?: string;
  image: string;
  original_price?: number | null;
  needs_options?: boolean;
};

type Related = { complementary: Product[]; similar: Product[] };

const formatPrice = (n: string | number) =>
  "₦" + Number(n).toLocaleString("en-NG");

const imgUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE}/${path.replace(/^\//, "")}`;

interface Props {
  productId: number;
  /** Set false if the page already shows its own "similar" grid. */
  showSimilar?: boolean;
}

export function RelatedProducts({ productId, showSimilar = true }: Props) {
  const [data, setData] = useState<Related | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidden while the customer is editing a cart line (?editCartId=…),
  // same as the app.
  const editing = !!useSearchParams().get("editCartId");

  useEffect(() => {
    if (editing) {
      setLoading(false);
      return undefined;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setData(null);
    fetch(`${API_BASE}/get-related-products.php?product_id=${productId}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        if (j?.status === "success" && j.data) {
          setData({
            complementary: j.data.complementary ?? [],
            similar: j.data.similar ?? [],
          });
        }
      })
      .catch(() => {}) // suggestions are optional: fail silently
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [productId, editing]);

  if (editing) return null;
  if (loading) return <Skeleton />;
  if (!data) return null;

  const compIds = new Set(data.complementary.map((p) => p.id));
  const similar = showSimilar
    ? data.similar.filter((p) => !compIds.has(p.id))
    : [];

  if (!data.complementary.length && !similar.length) return null;

  return (
    <div className="mt-14 space-y-10">
      <Row title="Goes well with this" items={data.complementary} quickAdd />
      <Row title="You may also like" items={similar} />
    </div>
  );
}

function Row({
  title,
  items,
  quickAdd,
}: {
  title: string;
  items: Product[];
  quickAdd?: boolean;
}) {
  const queryClient = useQueryClient();
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (p: Product) => addToCart(p.id, 1, { addons: [] }),
    onMutate: (p) => {
      setBusyId(p.id);
      setError(null);
    },
    onSuccess: (_d, p) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setAdded((s) => ({ ...s, [p.id]: true }));
    },
    onError: (e) => {
      // e.g. the cart already holds the other kind of order
      // (meals vs groceries): show the server's own message.
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't add this item. Please try again.",
      );
    },
    onSettled: () => setBusyId(null),
  });

  if (!items.length) return null;

  return (
    <section aria-label={title}>
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">
        {title}
      </h2>
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((p) => (
          <li
            key={p.id}
            className="w-40 shrink-0 snap-start rounded-2xl border border-line bg-bg-raised p-3 sm:w-48"
          >
            <Link href={`/products/${p.id}`} className="block">
              <div className="aspect-square overflow-hidden rounded-xl bg-brand-tint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl(p.image)}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm font-medium text-ink">
                {p.name}
              </p>
            </Link>
            <div className="mt-1 flex items-center justify-between">
              <span className="tabular text-sm text-ink-soft">
                {formatPrice(p.price)}
                {p.original_price ? (
                  <span className="ml-1 text-xs line-through opacity-60">
                    {formatPrice(p.original_price)}
                  </span>
                ) : null}
              </span>
              {quickAdd && p.needs_options && (
                <Link
                  href={`/products/${p.id}`}
                  className="rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand-deep hover:bg-brand-tint"
                >
                  Choose
                </Link>
              )}
              {quickAdd && !p.needs_options && (
                <button
                  type="button"
                  onClick={() => mutation.mutate(p)}
                  disabled={!!added[p.id] || busyId === p.id}
                  aria-label={`Add ${p.name} to cart`}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    added[p.id]
                      ? "bg-brand-tint text-brand-deep"
                      : "bg-brand text-white hover:bg-brand-deep disabled:opacity-60",
                  ].join(" ")}
                >
                  {added[p.id] ? <Check size={16} /> : <Plus size={16} />}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-line bg-brand-tint px-3 py-2 text-sm text-ink"
        >
          {error}
        </p>
      )}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="mt-14" aria-hidden>
      <div className="mb-4 h-6 w-44 rounded bg-brand-tint" />
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-60 w-40 shrink-0 rounded-2xl bg-brand-tint sm:w-48"
          />
        ))}
      </div>
    </div>
  );
}