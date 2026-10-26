// Forgiving category matching, plus an explicit map for restaurant meal
// categories (their products are tagged with specific dishes, not the
// category name).

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