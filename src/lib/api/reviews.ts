import { apiGet, apiRequest } from "./client";

// ── Shared ─────────────────────────────────────────────────────────────────
export interface ReviewPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ── Store reviews (get-vendor-reviews.php) ──────────────────────────────────
export interface StoreReview {
  id: number;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
  rating: number;
  comment: string | null;
  date: string;
}

export interface StoreReviewsData {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<number, number>;
  reviews: StoreReview[];
  pagination: ReviewPagination;
  /** True when the signed-in buyer has a delivered/completed order with this vendor they haven't reviewed yet. */
  can_review?: boolean;
  /** Main orders.id to send when submitting the review. */
  eligible_order_id?: number | null;
}

export function getStoreReviews(
  vendorId: number,
  page = 1,
  perPage = 10
): Promise<StoreReviewsData> {
  return apiGet("/get-vendor-reviews.php", {
    vendor_id: vendorId,
    page,
    per_page: perPage,
  });
}

// ── Submit store review (submit-vendor-review.php) ─────────────────────────
export interface SubmitStoreReviewInput {
  vendorId: number;
  /** Main orders.id (not vendor_orders.id). */
  orderId: number;
  rating: number;
  comment: string;
}

export function submitStoreReview(input: SubmitStoreReviewInput): Promise<unknown> {
  return apiRequest("/submit-vendor-review.php", {
    method: "POST",
    body: {
      vendor_id: input.vendorId,
      order_id: input.orderId,
      rating: input.rating,
      comment: input.comment,
    },
  });
}

// ── Product reviews for a vendor's products (get-vendor-product-reviews.php) ──
export interface VendorProductReview {
  id: number;
  product_id: number;
  product_name: string;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
  rating: number;
  review_text: string | null;
  date: string;
}

export interface ProductReviewsData {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<number, number>;
  reviews: VendorProductReview[];
  pagination: ReviewPagination;
}

export function getVendorProductReviews(
  vendorId: number,
  page = 1,
  perPage = 10
): Promise<ProductReviewsData> {
  return apiGet("/get-vendor-product-reviews.php", {
    vendor_id: vendorId,
    page,
    per_page: perPage,
  });
}