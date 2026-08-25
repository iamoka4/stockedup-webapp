import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getVendorDetails } from "@/lib/api/vendors";
import { StampBadge } from "@/components/StampBadge";
import { VendorProductGrid } from "./VendorProductGrid";
import { DEFAULT_CITY } from "@/lib/config";
import { extractVendorId } from "@/lib/utils/slug";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchVendor(id: string) {
  const vendorId = extractVendorId(id);
  if (vendorId === null || vendorId <= 0) return null;
  try {
    return await getVendorDetails(vendorId);
  } catch (err) {
    // Logged server-side (this runs during SSR) so a failed backend call
    // shows up in the `npm run dev` terminal instead of silently 404ing.
    console.error(`[vendor ${id}] fetchVendor failed:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchVendor(id);
  if (!data) return { title: "Vendor not found" };

  const { vendor } = data;
  return {
    title: `${vendor.shop_name} — Order foodstuff online in ${DEFAULT_CITY}`,
    description:
      vendor.description ||
      `Order from ${vendor.shop_name} in ${DEFAULT_CITY}. Fresh foodstuff and groceries delivered to your door.`,
    openGraph: {
      title: vendor.shop_name,
      images: vendor.shop_logo ? [vendor.shop_logo] : undefined,
    },
  };
}

export default async function VendorDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchVendor(id);
  if (!data) notFound();

  const { vendor, products, reviews } = data;

  return (
    <div>
      <div className="border-b border-line bg-bg-raised">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-indigo-tint">
            {vendor.shop_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.shop_logo} alt={vendor.shop_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-3xl text-indigo">
                {vendor.shop_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {vendor.shop_name}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{vendor.location}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StampBadge tone={vendor.vendor_status?.status === "open" ? "leaf" : "clay"}>
                {vendor.vendor_status?.status === "open" ? "Open now" : "Closed"}
              </StampBadge>
              <StampBadge tone="brand">
                <Star size={11} fill="currentColor" strokeWidth={0} />
                {vendor.average_rating.toFixed(1)} ({vendor.total_reviews})
              </StampBadge>
              <span className="text-xs text-ink-soft">Joined {vendor.date_joined}</span>
            </div>
            {vendor.description && (
              <p className="mt-3 max-w-xl text-sm text-ink-soft">{vendor.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          Products from {vendor.shop_name}
        </h2>
        <VendorProductGrid products={products} vendorId={vendor.id} />
      </div>

      {reviews.data.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">Reviews</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.data.map((review) => (
              <div key={review.id} className="rounded-2xl border border-line bg-bg-raised p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{review.reviewer_name}</span>
                  <StampBadge tone="brand">
                    <Star size={11} fill="currentColor" strokeWidth={0} />
                    {review.rating}
                  </StampBadge>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>
                <p className="mt-2 text-xs text-ink-soft">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}