// Forgiving category matching, an explicit map for restaurant meal
// categories (their products are tagged with specific dishes, not the
// category name), and hand-picked category images.

const STOP = new Set(["and", "the", "of", "meal", "meals", "dish", "dishes"]);

const stem = (w: string) =>
  w.length > 3 && w.endsWith("ies")
    ? w.slice(0, -3) + "y"
    : w.length > 3 && w.endsWith("s") && !w.endsWith("ss")
      ? w.slice(0, -1)
      : w;

const tokens = (s?: string | null): string[] =>
  (s ?? "")
    .toLowerCase()
    .replace(/&/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem);

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

export function categoryMatches(
  productCategory: string | null | undefined,
  names: string[],
): boolean {
  const p = tokens(productCategory);
  if (p.length === 0) return false;
  return names.some((name) => {
    const c = tokens(name);
    if (c.length === 0) return false;
    return p.every((w) => c.includes(w)) || c.every((w) => p.includes(w));
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function categoryNames(c: any): string[] {
  return [
    c.category_name ?? c.name ?? "",
    ...String(c.sub_categories ?? "").split(","),
  ].filter((s) => s && s.trim());
}

// Meal category name -> product `category` tags that belong under it
// (all lowercase). A product can appear under more than one category.
const MEAL_CATEGORY_TAGS: Record<string, string[]> = {
  "local dishes": [
    "local dishes", "other local specialties", "ogbono", "oha", "egusi",
    "okra", "bitterleaf", "nsala", "vegetable soup", "soups", "fufu",
    "garri/eba", "semovita", "yam", "plantain", "native rice",
  ],
  "fast food": [
    "fast food", "shawarma", "fries", "meat pie", "family packs",
    "bbq chicken", "chicken",
  ],
  drinks: ["drinks", "soft drinks", "juice", "water"],
  water: ["water"],
  "rice & rice dishes": [
    "rice & rice dishes", "fried rice", "jollof rice", "white rice",
    "native rice",
  ],
  soups: [
    "soups", "ogbono", "oha", "vegetable soup", "egusi", "okra",
    "bitterleaf", "nsala",
  ],
  swallow: ["fufu", "garri/eba", "semovita"],
  "proteins & meat": [
    "chicken", "beef", "turkey", "fish", "assorted meat", "bbq chicken",
  ],
  "grills & bbq": ["barbecue", "bbq chicken"],
  breakfast: ["breakfast", "breakfast combos"],
  "snacks & pastries": [
    "snacks & pastries", "meat pie", "doughnut", "chin chin", "fries",
  ],
  desserts: ["desserts", "parfait", "ice cream", "cakes"],
  "combos & specials": ["lunch specials", "breakfast combos", "family packs"],
};

// Does a product belong to this meal category? Uses the map above; a category
// that isn't in the map falls back to name matching.
export function mealCategoryMatches(
  productCategory: string | null | undefined,
  categoryName: string | null | undefined,
): boolean {
  const p = norm(productCategory);
  const key = norm(categoryName);
  if (!p || !key) return false;
  const tags = MEAL_CATEGORY_TAGS[key];
  if (!tags) return categoryMatches(productCategory, [key]);
  return p === key || tags.includes(p);
}

// ── Hand-picked category images ──
// For these meal categories, use a specific product's photo: the product from
// that vendor whose name contains the dish. Text is compared with all spaces
// and punctuation removed, so spelling like "King Fries" still matches.
type ImageProduct = {
  name?: string | null;
  vendor_name?: string | null;
  image?: string | null;
  category?: string | null;
};

const squash = (s?: string | null) =>
  (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const MEAL_CATEGORY_IMAGE_PICKS: Record<string, { vendor: string; dish: string }> = {
  breakfast: { vendor: "kingfries", dish: "spaghetti" },
  soups: { vendor: "megzy", dish: "okrasoup" },
  "combos & specials": { vendor: "egovin", dish: "basmatirice" },
};

// Image for a meal category: the hand-picked product if one is set and found,
// otherwise the first matching product that has a photo.
export function pickMealCategoryImage(
  categoryName: string | null | undefined,
  products: ImageProduct[],
): string | null {
  const pick = MEAL_CATEGORY_IMAGE_PICKS[norm(categoryName)];
  if (pick) {
    const hit = products.find(
      (p) =>
        p.image &&
        squash(p.vendor_name).includes(pick.vendor) &&
        squash(p.name).includes(pick.dish),
    );
    if (hit?.image) return hit.image;
  }
  const match = products.find(
    (p) => p.image && mealCategoryMatches(p.category, categoryName),
  );
  return match?.image ?? null;
}