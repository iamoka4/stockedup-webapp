import Link from "next/link";
import { StampBadge } from "@/components/StampBadge";
import type { SearchProduct } from "@/lib/api/products";

const TYPE_LABEL: Record<string, string> = {
  restaurant: "Meal",
  grocery: "Grocery",
  supermarket: "Supermarket",
};

// Same rule as the mobile app: stock <= 0 (or missing) means sold out.
function isSoldOut(p: SearchProduct): boolean {
  if (typeof p.sold_out === "boolean") return p.sold_out;
  if (p.stock === "outOfStock") return true;
  const n = Number(p.stock);
  return !Number.isFinite(n) || n <= 0;
}

export function SearchResultCard({ p }: { p: SearchProduct }) {
  const soldOut = isSoldOut(p);
  const typeLabel = p.business_type ? TYPE_LABEL[p.business_type] : undefined;

  return (
    <Link
      href={`/products/${p.id}`}
      className={`flex gap-3 rounded-2xl border border-line p-3 transition-colors hover:border-brand ${
        soldOut ? "bg-bg" : "bg-bg-raised"
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover ${soldOut ? "opacity-60" : ""}`}
        />
        {soldOut && (
          <div className="absolute left-1 top-1">
            <StampBadge tone="clay">Sold out</StampBadge>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-ink">{p.name}</p>
        {p.vendor_name ? (
          <p className="truncate text-xs text-ink-soft">{p.vendor_name}</p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="tabular text-sm font-semibold text-ink">
            ₦{p.price.toLocaleString("en-NG")}
          </span>
          {typeLabel ? (
            <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-deep">
              {typeLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}