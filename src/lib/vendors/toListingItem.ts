import type { Vendor } from "@/lib/api/types";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

/**
 * Grocery vendors come from get-vendors.php. It returns logo, cover photo,
 * open/closed `status` (worked out on the server from the vendor's hours in
 * the DB), a base delivery estimate and, when customer coordinates are sent,
 * a distance. This maps them onto the listing shape so they can use the exact
 * same card as restaurants and supermarkets.
 *
 * An explicit `status` argument overrides the server value; pass "" to hide
 * the OPEN/CLOSED badge.
 */
type VendorWithListingFields = Vendor & {
  status?: string | null;
  delivery_estimate?: number | null;
  distance_km?: number | null;
  delivers_here?: boolean | null;
};

const normalizeStatus = (s?: string | null): "" | "open" | "closed" => {
  const v = (s ?? "").toLowerCase();
  return v === "open" || v === "closed" ? v : "";
};

export function vendorToListingItem(
  v: VendorWithListingFields,
  status?: "" | "open" | "closed"
): VendorListingItem {
  return {
    id: v.id,
    shop_name: v.shop_name || v.name,
    status: status !== undefined ? status : normalizeStatus(v.status),
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