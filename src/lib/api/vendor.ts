import { apiGet, apiRequest, apiUpload } from "./client";

/**
 * ⚠ SET THIS to the real filename of the update-location PHP endpoint
 * (the one that validates latitude/longitude/city and updates vendors).
 * I couldn't see its name or the useUpdateVendorLocation hook, so this
 * is a placeholder.
 */
export const UPDATE_LOCATION_PATH = "/update-vendor-location.php";

export interface ShopProfile {
  business_name?: string | null;
  shop_name?: string | null;
  description?: string | null;
  phone_number?: string | null;
  email?: string | null;
  owner?: { phone?: string | null; email?: string | null } | null;
  location?: string | null;
  store_address?: string | null;
  city?: string | null;
  state?: string | null;
  profile_pic?: string | null;
  cover_photo?: string | null;
  status?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  // Both returned by get-shop-profile.php. business_type ("restaurant",
  // "grocery", "supermarket", ...) drives the Product Listing page.
  vendor_id?: number | string | null;
  business_type?: string | null;
}

export function getShopProfile(): Promise<ShopProfile> {
  return apiRequest<ShopProfile>("/get-shop-profile.php");
}

export function saveShopProfile(input: {
  storeName: string;
  description: string;
  location: string;
  phoneNumber: string;
  email: string;
  logo?: File;
  cover?: File;
}): Promise<Record<string, unknown>> {
  // Field names match save-shop-profile.php exactly.
  const form = new FormData();
  form.append("store_name", input.storeName);
  form.append("description", input.description);
  form.append("location", input.location);
  form.append("phone_number", input.phoneNumber);
  form.append("email", input.email);
  if (input.logo) form.append("image", input.logo); // -> vendors.shop_logo
  if (input.cover) form.append("cover_image", input.cover); // -> vendors.store_image
  return apiUpload<Record<string, unknown>>("/save-shop-profile.php", form);
}

export function updateVendorLocation(input: {
  latitude: number;
  longitude: number;
  city: string; // lowercase supported-city key, e.g. "portharcourt"
}): Promise<{ latitude: number; longitude: number; city: string }> {
  return apiRequest(UPDATE_LOCATION_PATH, { method: "POST", body: input });
}

/** Shop name, description and address have been saved. */
export function isProfileComplete(p: ShopProfile): boolean {
  return !!(p.description?.trim() && p.location?.trim());
}

/**
 * True when the shop pin hasn't been set. Only enforced when the profile
 * endpoint reports coordinates at all (the "latitude" key exists);
 * null, empty and 0 all count as "not set".
 */
export function needsLocation(p: ShopProfile): boolean {
  if (!("latitude" in p)) return false;
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  return !(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0);
}

export function isOnboardingComplete(p: ShopProfile): boolean {
  return isProfileComplete(p) && !needsLocation(p);
}

// ─── Dashboard metrics ───────────────────────────────────────────────────────

export interface OrderMetric {
  metrics?: {
    totalOrders?: number;
    totalSales?: number;
    pendingOrders?: number;
    acceptedOrders?: number;
    enrouteOrders?: number;
    declinedOrders?: number;
    deliveredOrders?: number;
  };
  rating?: { avgRating?: number; totalReviews?: number };
  orders?: Array<Record<string, unknown>>;
}

export async function getOrdersMetric(): Promise<OrderMetric> {
  const res = await apiRequest<OrderMetric | { data?: OrderMetric }>("/get-the-vendor-orders.php");
  // The backend wraps the payload as { status, message, data: { metrics, rating, orders } }.
  // Unwrap it here in case apiRequest hands back the raw JSON body.
  if (res && typeof res === "object" && "data" in res && res.data) return res.data;
  return res as OrderMetric;
}

// ─── Order status (accept / reject) ──────────────────────────────────────────

export type OrderStatus = "pending" | "accepted" | "rejected" | "enroute" | "completed";

/**
 * Mirrors the mobile useUpdateOrderStatus hook (POST /update-order-status.php).
 * The vendor only accepts or rejects; later statuses come from the rider app.
 * apiRequest already unwraps the { status, message, data } envelope and throws
 * ApiError (with the backend's message) when status isn't "success".
 */
export function updateOrderStatus(payload: {
  orderId: number;
  vendorOrderId?: number;
  status: OrderStatus;
  rejectionReason?: string;
}): Promise<unknown> {
  return apiRequest<unknown>("/update-order-status.php", {
    method: "POST",
    body: {
      order_id: payload.orderId,
      vendor_order_id: payload.vendorOrderId,
      status: payload.status.toLowerCase(),
      rejection_reason: payload.rejectionReason ?? null,
    },
  });
}

// ─── Product listing (add / edit / delete) ───────────────────────────────────

export interface ProductAddonOption {
  id?: number;
  name: string;
  price: number;
  max_quantity: number;
}

export interface ProductAddonGroup {
  id?: number;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  allow_multiple_quantity: boolean;
  options: ProductAddonOption[];
}

export interface VendorProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string | null;
  category: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  extras?: string | null;
  image: string;
  status: "approved" | "pending" | "rejected";
  // Undefined when the endpoint doesn't return addons at all — treat that as
  // "unknown", not "no addons" (editing must not wipe them in that case).
  addon_groups?: ProductAddonGroup[];
}

export interface VendorProductCounts {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface VendorProductsData {
  counts: VendorProductCounts;
  products: VendorProduct[];
}

/** GET /get_vendor_products.php (underscores — same endpoint the mobile hook uses). */
export function getVendorProducts(): Promise<VendorProductsData> {
  return apiRequest<VendorProductsData>("/get_vendor_products.php");
}

export interface ProductSubcategory {
  id: number;
  name: string;
  slug: string | null;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  subcategories: ProductSubcategory[];
}

/** Category → Subcategory tree for one business type (public endpoint). */
export async function getProductCategories(businessType: string): Promise<ProductCategory[]> {
  const data = await apiGet<{ categories?: ProductCategory[] }>("/get-product-categories.php", {
    business_type: businessType,
  });
  return data?.categories ?? [];
}

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  stock: string;
  unit: string;
  /** Free-text `category` column: the subcategory name when one is chosen, else the category name. */
  category: string;
  categoryId: number | null;
  subcategoryId: number | null;
  extras: string | null;
  /**
   * undefined = don't send `addon_groups` at all. On edit that leaves the product's
   * existing addons untouched; sending [] (even empty) replaces them wholesale.
   */
  addonGroups?: ProductAddonGroup[];
  image?: File;
}

// Field names match upload-product.php / edit-product.php (same as the mobile hooks).
function appendProductFields(form: FormData, input: ProductInput) {
  form.append("productName", input.name);
  form.append("description", input.description);
  form.append("price", input.price);
  form.append("stock", input.stock);
  form.append("unit", input.unit);
  form.append("category", input.category);
  if (input.categoryId != null) form.append("category_id", String(input.categoryId));
  if (input.subcategoryId != null) form.append("subcategory_id", String(input.subcategoryId));
  form.append("extras", input.extras ?? "");
  if (input.addonGroups !== undefined) {
    form.append("addon_groups", JSON.stringify(input.addonGroups));
  }
  if (input.image) form.append("productImage", input.image);
}

export function addProduct(input: ProductInput): Promise<Record<string, unknown>> {
  const form = new FormData();
  appendProductFields(form, input);
  return apiUpload<Record<string, unknown>>("/upload-product.php", form);
}

export function editProduct(
  input: ProductInput & { productId: number; vendorId?: number | string | null },
): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append("product_id", String(input.productId));
  if (input.vendorId != null) form.append("vendor_id", String(input.vendorId));
  appendProductFields(form, input);
  // edit-product.php: omitting subcategory_id leaves the old value in place; an empty
  // string clears it. Without this, choosing "None" (or changing the category) keeps a
  // stale subcategory on the product.
  if (input.subcategoryId == null) form.append("subcategory_id", "");
  return apiUpload<Record<string, unknown>>("/edit-product.php", form);
}

/** Soft-deletes one of the signed-in vendor's products (the server ignores vendor_id and uses the token). */
export function deleteProduct(productId: number, vendorId?: number | string | null): Promise<unknown> {
  return apiRequest<unknown>("/delete-product.php", {
    method: "POST",
    body: { product_id: productId, ...(vendorId != null ? { vendor_id: vendorId } : {}) },
  });
}