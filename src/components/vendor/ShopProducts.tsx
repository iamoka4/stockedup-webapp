import Link from "next/link";
import { productImageUrl, stockInfo, type VendorProduct } from "@/lib/api/vendor-products";
import { ErrorBanner } from "./ui";

const PAGE_LIMIT = 14;

function AddProductButton({ href, large = false }: { href: string | null; large?: boolean }) {
  const size = large ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs sm:text-sm";
  const base = `inline-flex items-center gap-1.5 rounded-full bg-brand font-bold text-white ${size}`;
  if (!href) {
    return (
      <span aria-disabled title="Coming soon" className={`${base} cursor-not-allowed opacity-40`}>
        + Add Product
      </span>
    );
  }
  return (
    <Link href={href} className={`${base} transition hover:bg-brand-deep`}>
      + Add Product
    </Link>
  );
}

export function ShopProducts({
  products,
  error,
  addHref = null,
  viewAllHref = null,
}: {
  /** null while loading */
  products: VendorProduct[] | null;
  error: string | null;
  /** Where "Add Product" goes. null shows it greyed out until that page exists. */
  addHref?: string | null;
  /** Where "View All Products" goes. null shows every product here instead. */
  viewAllHref?: string | null;
}) {
  if (error) {
    return (
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Products</h2>
        <ErrorBanner message={error} />
      </section>
    );
  }

  if (products === null) {
    return (
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Products</h2>
        <p className="text-ink-soft">Loading products…</p>
      </section>
    );
  }

  const shown = viewAllHref ? products.slice(0, PAGE_LIMIT) : products;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">All Products ({products.length})</h2>
        <AddProductButton href={addHref} />
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-line bg-bg-raised px-6 py-12 text-center">
          <p className="text-5xl" aria-hidden>
            📦
          </p>
          <h3 className="mt-4 font-display text-lg font-bold">No products yet</h3>
          <p className="mt-1 text-sm text-ink-soft">Start by adding your first product.</p>
          <div className="mt-5 flex justify-center">
            <AddProductButton href={addHref} large />
          </div>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shown.map((p) => {
              const info = stockInfo(p.stock);
              const img = productImageUrl(p.image);
              return (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-line bg-bg-raised"
                >
                  <div className="relative aspect-4/3 bg-bg">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-3xl" aria-hidden>
                        🛍️
                      </span>
                    )}
                    <span
                      className="absolute right-2 top-2 rounded-md px-2 py-1 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: info.color }}
                    >
                      {info.label}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                    <p className="mt-1 font-bold text-brand-deep">
                      ₦{p.price.toLocaleString()}
                    </p>
                    {p.category && <p className="mt-0.5 text-xs text-ink-soft">{p.category}</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="mt-5 flex items-center justify-center gap-1.5 rounded-2xl border border-brand bg-bg-raised py-3.5 text-sm font-bold text-brand-deep transition hover:bg-brand-tint"
            >
              View All Products →
            </Link>
          )}
        </>
      )}
    </section>
  );
}