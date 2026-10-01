import Link from "next/link";
import type { Product } from "@/lib/api/types";

// Static class names so Tailwind keeps them.
const ROWS = { 1: "grid-rows-1", 2: "grid-rows-2", 3: "grid-rows-3" } as const;

function ProductTile({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.id}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl bg-brand-tint">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center font-display text-2xl font-bold text-brand-deep">
            {p.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-ink">
        {p.name}
      </p>
      <p className="tabular text-xs text-ink-soft">
        ₦{Number(p.price).toLocaleString()}
        {p.unit ? ` / ${p.unit}` : ""}
      </p>
    </Link>
  );
}

// Horizontal scroller laid out in 1-3 rows, like the mobile product columns.
export function ProductRail({
  title,
  products,
  rows = 1,
  titleClassName = "text-ink",
}: {
  title: string;
  products: Product[];
  rows?: 1 | 2 | 3;
  titleClassName?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className={`mb-4 font-display text-lg font-bold sm:text-xl ${titleClassName}`}>
        {title}
      </h2>
      <div
        className={`grid auto-cols-[8rem] grid-flow-col gap-3 overflow-x-auto pb-2 ${ROWS[rows]}`}
      >
        {products.map((p) => (
          <ProductTile key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}