export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Vendor shop names aren't guaranteed unique (unlike categories), so a
 * pure name-slug could collide across vendors. We embed the numeric id
 * as a trailing suffix — readable in the URL, but still unambiguous to
 * resolve back to a single vendor. e.g. "Bright Foodstore" (id 42) ->
 * "bright-foodstore-42".
 */
export function vendorSlug(vendor: { id: number; shop_name: string }): string {
  return `${slugify(vendor.shop_name)}-${vendor.id}`;
}

/**
 * Extracts the vendor id from a slug produced by vendorSlug(), or from a
 * raw numeric id (for backward compatibility with any existing /vendors/42
 * links that predate slugs).
 */
export function extractVendorId(slugOrId: string): number | null {
  if (/^\d+$/.test(slugOrId)) return Number(slugOrId);
  const match = slugOrId.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}