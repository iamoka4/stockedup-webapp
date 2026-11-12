const naira = (n: number | string) => `₦${Number(n).toLocaleString("en-NG")}`;

export function getDiscount(
  price: number | string,
  originalPrice?: number | string | null,
) {
  const current = Number(price);
  const original = originalPrice != null ? Number(originalPrice) : null;
  const hasDiscount = original !== null && original > current;
  const percentOff = hasDiscount
    ? Math.round(((original - current) / original) * 100)
    : 0;
  return { hasDiscount, percentOff };
}

/** Put inside a `relative` image wrapper. */
export function DiscountBadge({
  price,
  originalPrice,
}: {
  price: number | string;
  originalPrice?: number | string | null;
}) {
  const { hasDiscount, percentOff } = getDiscount(price, originalPrice);
  if (!hasDiscount) return null;
  return (
    <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white shadow-sm">
      -{percentOff}%
    </span>
  );
}

export function PriceTag({
  price,
  originalPrice,
  className = "text-lg",
}: {
  price: number | string;
  originalPrice?: number | string | null;
  className?: string;
}) {
  const { hasDiscount } = getDiscount(price, originalPrice);
  return (
    <div className="flex flex-col leading-tight">
      {hasDiscount && (
        <span className="tabular text-xs text-ink-soft line-through">
          {naira(originalPrice!)}
        </span>
      )}
      <span className={`tabular font-display font-semibold text-ink ${className}`}>
        {naira(price)}
      </span>
    </div>
  );
}