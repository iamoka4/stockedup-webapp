import Link from "next/link";
import { StampBadge } from "@/components/StampBadge";
import type { Product } from "@/lib/api/types";

type Section = "main" | "desserts" | "snacks" | "drinks";
// get-products.php adds `section` to typed listings (food/groceries/supermarkets).
type ListedProduct = Product & { section?: Section };

const SECTION_ORDER: Section[] = ["main", "desserts", "snacks", "drinks"];
const SECTION_LABELS: Record<Exclude<Section, "main">, string> = {
  desserts: "Cakes & Desserts",
  snacks: "Snacks",
  drinks: "Drinks",
};

function isOutOfStock(stock: Product["stock"]) {
  if (stock === "outOfStock") return true;
  const n = Number(stock);
  return Number.isFinite(n) && n <= 0;
}

function ProductCard({ p }: { p: Product }) {
  const out = isOutOfStock(p.stock);
  return (
    <Link
      href={`/products/${p.id}`}
      className="rounded-2xl border border-line bg-bg-raised p-3 transition-colors hover:border-brand"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-tint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover ${out ? "opacity-60" : ""}`}
        />
        {out && (
          <div className="absolute left-2 top-2">
            <StampBadge tone="clay">Out of stock</StampBadge>
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">{p.name}</p>
      <p className="tabular text-sm text-ink-soft">
        ₦{p.price.toLocaleString("en-NG")}
        {p.unit ? <span className="text-xs"> / {p.unit}</span> : null}
      </p>
    </Link>
  );
}

interface Props {
  title: string;
  intro: string;
  products: Product[];
  /** True when the API call failed (shown instead of the empty message). */
  failed?: boolean;
  emptyText: string;
  /** Heading for the main (non-dessert, non-snack, non-drink) section. Defaults to `title`. */
  mainLabel?: string;
}

export function ProductListingPage({
  title,
  intro,
  products,
  failed,
  emptyText,
  mainLabel,
}: Props) {
  const groups = SECTION_ORDER.map((key) => ({
    key,
    items: (products as ListedProduct[]).filter((p) => (p.section ?? "main") === key),
  })).filter((g) => g.items.length > 0);

  // Only show section headings when there is more than one section.
  const showHeadings = groups.length > 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{intro}</p>

      {failed ? (
        <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Couldn&apos;t load this right now
          </p>
          <p className="mt-1 text-sm text-ink-soft">Please refresh the page in a moment.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <p className="text-sm text-ink-soft">{emptyText}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-soft">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
          {groups.map((g) => (
            <section key={g.key} className="mt-6">
              {showHeadings && (
                <h2 className="font-display text-xl font-semibold text-ink">
                  {g.key === "main" ? (mainLabel ?? title) : SECTION_LABELS[g.key]}
                </h2>
              )}
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {g.items.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}