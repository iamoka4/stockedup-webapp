// lib/api/promo.ts
import { apiGet } from "./client";

export interface PromoSlide {
  id: number;
  /** Admin label, used as the image alt text. Not drawn on screen. */
  title: string;
  imageUrl: string;
  /** Destination key, in-app route or https URL. null = not clickable. */
  link: string | null;
}

interface PromoSlideRow {
  id: number;
  title: string;
  image_url: string;
  cta_link: string | null;
  sort_order: number;
}

// Same shape as getCategories(): apiGet unwraps the endpoint's `data` object.
function fetchPromoSlides(): Promise<{ slides: PromoSlideRow[] }> {
  return apiGet("/get-promo-slides.php");
}

/**
 * Flyer slides for the home banner. The server already filters by active
 * flag and campaign dates (server clock), so the result is used as-is.
 */
export async function getPromoSlides(): Promise<PromoSlide[]> {
  const body: any = await fetchPromoSlides();
  // Tolerate apiGet returning either the unwrapped data or the full body.
  const rows: PromoSlideRow[] = body?.slides ?? body?.data?.slides ?? [];

  return rows
    .map((r) => ({
      id: Number(r.id),
      title: String(r.title ?? ""),
      imageUrl: String(r.image_url ?? ""),
      link: r.cta_link ? String(r.cta_link) : null,
    }))
    .filter((s) => s.imageUrl !== "");
}