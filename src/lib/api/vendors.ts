import { apiGet } from "./client";
import type { Vendor, VendorDetailsResponse } from "./types";

/**
 * Pass `city` (the display label, e.g. "Awka" or "Port Harcourt") to get only
 * the vendors serving that city. Omit it for the unfiltered list (used on the
 * landing page's partners section, which is intentionally not location-based).
 */
export function getVendors(city?: string): Promise<{ vendors: Vendor[] }> {
  return apiGet("/get-vendors.php", { city });
}

export function getVendorDetails(
  vendorId: number,
  page = 1,
  perPage = 10
): Promise<VendorDetailsResponse> {
  return apiGet("/get-vendor-details.php", {
    vendor_id: vendorId,
    page,
    per_page: perPage,
  });
}