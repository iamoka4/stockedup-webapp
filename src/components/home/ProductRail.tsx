import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/api/types";

// Static class names so Tailwind keeps them.
const ROWS = { 1: "grid-rows-1", 2: "grid-rows-2", 3: "grid-rows-3" } as const;

// Same column width as HotProductsSection: about two columns visible on
// phones (with a peek of the next), fixed widths from sm up.
const COLUMN_WIDTH =
  "auto-cols-[min(44vw,260px)] sm:auto-cols-[14rem] lg:auto-cols-[16rem]";

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
        className={`scrollbar-none grid snap-x grid-flow-col gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${COLUMN_WIDTH} ${ROWS[rows]}`}
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} hideCartControls />
          </div>
        ))}
      </div>
    </section>
  );
}