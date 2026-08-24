import { Suspense } from "react";
import { ProductsSearchClient } from "./ProductsSearchClient";

export default function ProductsSearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-ink-soft">Loading…</div>}>
      <ProductsSearchClient />
    </Suspense>
  );
}
