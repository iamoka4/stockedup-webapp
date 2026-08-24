/**
 * Types mirror the ACTUAL response shapes confirmed during the backend
 * audit — not idealized/guessed shapes. Where two endpoints return the
 * same entity slightly differently (e.g. login.php's `access_token` vs
 * vendor-login.php's `token`), that's normalized in lib/api/auth.ts, not
 * here — these types reflect the raw wire format per file.
 */

export interface ApiEnvelope<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export interface Vendor {
  id: number;
  name: string;
  shop_name: string;
  state: string;
  city: string;
  average_rating: number;
  image: string | null;
}

export interface VendorDetails {
  id: number;
  shop_name: string;
  shop_logo: string | null;
  description: string;
  location: string;
  date_joined: string;
  average_rating: number;
  total_reviews: number;
  vendor_status: {
    status?: string;
    [key: string]: unknown;
  };
}

export interface VendorProductSummary {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url: string;
}

export interface VendorReview {
  id: number;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  comment: string;
  date: string;
}

export interface VendorDetailsResponse {
  vendor: VendorDetails;
  products: VendorProductSummary[];
  reviews: {
    data: VendorReview[];
    rating_breakdown: Record<string, number>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    can_review: boolean;
    eligible_orders: { order_id: number; order_uid: string; date: string }[];
  };
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock: string | number;
  image: string;
  vendor_id: number;
}

export interface ProductDetail {
  id: number;
  vendor_id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  stock: string | number;
  in_stock: boolean;
  created_at: string;
  vendor: {
    id: number;
    name: string;
    city: string;
    state: string;
    description: string;
    image: string;
  };
}

export interface ProductDetailResponse {
  product: ProductDetail;
  reviews: {
    id: number;
    user_name: string;
    rating: number;
    review_text: string;
    created_at: string;
  }[];
  review_stats: {
    total: number;
    avg_rating: number;
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  related_products: {
    id: number;
    name: string;
    price: number;
    unit: string;
    image: string;
  }[];
}

export interface Category {
  id: number;
  name: string;
  image: string;
  sub_categories: string | null;
}

export interface CartItem {
  product_id: number;
  vendor_id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
  unit: string;
  quantity: number;
  shipping_address: string | null;
}

export interface UserAddress {
  id: number;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean | number;
}

export interface AuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  role: "buyer" | "vendor";
  city?: string;
  shop_name?: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  image_url: string;
}

export interface Order {
  order_id: number;
  order_uid: string;
  subtotal: number;
  processing_fee: number;
  delivery_fee: number;
  total: number;
  shipping_address: string;
  is_paid: string;
  is_rated: number;
  status: string;
  accepted: boolean | null;
  vendor_id: number | null;
  store_name: string;
  shop_logo: string;
  date: string;
  created_at: string;
  customer_notes: string | null;
  items: OrderItem[];
}

export interface DeliveryFeeResult {
  city: string;
  vendor: string;
  distance_km: number;
  base_fee: number;
  distance_fee: number;
  total: number;
  currency: string;
}
