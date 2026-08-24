import { apiGet } from "./client";
import type { Vendor, VendorDetailsResponse } from "./types";

export function getVendors(): Promise<{ vendors: Vendor[] }> {
  return apiGet("/get-vendors.php");
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
