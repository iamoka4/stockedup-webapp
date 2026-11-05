import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getVendorDetails } from "@/lib/api/vendors";
import { getStoreReviews, type StoreReviewsData } from "@/lib/api/reviews";
import { StampBadge } from "@/components/StampBadge";
import VendorRefCapture from "@/components/vendor/VendorRefCapture";
import { VendorProductGrid } from "./VendorProductGrid";
import { VendorReviews } from "./VendorReviews";
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

// Public first page of store reviews. Used for the header rating and to
// server-render the reviews list. The client component refetches with the
// buyer's session to find out whether they can leave a review.
async function fetchStoreReviews(vendorId: number): Promise<StoreReviewsData | null> {
  try {
    return await getStoreReviews(vendorId, 1, 10);
  } catch (err) {
    console.error(`[vendor ${vendorId}] fetchStoreReviews failed:`, err);
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

  const { vendor, products } = data;
  const storeReviews = await fetchStoreReviews(vendor.id);

  // The header rating follows the store-reviews summary (same as the mobile app),
  // so what buyers rate on the order screen shows up here. Falls back to the vendor record.
  const avgRating =
    Number(storeReviews ? storeReviews.average_rating : vendor.average_rating) || 0;
  const totalReviews =
    Number(storeReviews ? storeReviews.total_reviews : vendor.total_reviews) || 0;

  return (
    <div>
      {/* Saves ?ref=CODE from a vendor referral link/QR so sign-up can credit this vendor */}
      <VendorRefCapture />

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
              {/* Tap the rating to jump to the reviews section */}
              <a href="#reviews" aria-label="Jump to reviews">
                <StampBadge tone="brand">
                  <Star size={11} fill="currentColor" strokeWidth={0} />
                  {avgRating.toFixed(1)} ({totalReviews})
                </StampBadge>
              </a>
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

      <VendorReviews vendorId={vendor.id} initialStore={storeReviews} />
    </div>
  );
}