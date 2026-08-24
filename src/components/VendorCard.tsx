import Link from "next/link";
import { Star } from "lucide-react";
import { StampBadge } from "./StampBadge";
import type { Vendor } from "@/lib/api/types";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-raised sm:w-auto"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-indigo-tint">
        {vendor.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.image}
            alt={vendor.shop_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-indigo">
            {vendor.shop_name?.charAt(0) ?? "S"}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="font-display text-base font-semibold text-ink">{vendor.shop_name}</h3>
        <p className="text-xs text-ink-soft">
          {vendor.city}
          {vendor.state ? `, ${vendor.state}` : ""}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StampBadge tone="brand">
            <Star size={11} fill="currentColor" strokeWidth={0} />
            {vendor.average_rating.toFixed(1)}
          </StampBadge>
        </div>
      </div>
    </Link>
  );
}
