import type { Vendor } from "@/lib/api/types";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

/**
 * Grocery vendors come from get-vendors.php, which returns logo and cover
 * photo but no open/closed status or distance (those come from the
 * restaurant / supermarket listing endpoints). This maps them onto the
 * listing shape so they can use the exact same card.
 *
 * `status` comes from useGroceryHoursStatus (the 9 to 5 rule mobile uses). Pass
 * "" to hide the OPEN/CLOSED badge. The delivery pill shows only when
 * get-vendors.php supplies `delivery_estimate`; the distance chip stays
 * hidden because this endpoint has no distance data.
 */
type VendorWithDelivery = Vendor & {
  delivery_estimate?: number | null;
  distance_km?: number | null;
  delivers_here?: boolean | null;
};

export function vendorToListingItem(
  v: VendorWithDelivery,
  status: "" | "open" | "closed" = ""
): VendorListingItem {
  return {
    id: v.id,
    shop_name: v.shop_name || v.name,
    status,
    cover_image: v.cover_image ?? v.logo ?? v.image,
    logo: v.logo ?? v.image,
    city: v.city || null,
    state: v.state || null,
    distance_km: v.distance_km ?? null,
    rating: { average: v.average_rating ?? null },
    delivery: {
      estimate: v.delivery_estimate ?? null,
      delivers_here: v.delivers_here ?? null,
    },
  };
}