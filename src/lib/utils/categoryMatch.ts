// Forgiving category matching: ignores case, "&" / "and" and plurals, so a
// category like "Combos & Specials" matches products tagged "Combo" or
// "Specials", and "Grills & Barbecue" matches "Grill".

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

// names: the category's name plus any sub-categories.
// A product matches when all of its category words appear in the category's
// words, or all of the category's words appear in the product's.
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

// All the names a category can be matched by.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function categoryNames(c: any): string[] {
  return [
    c.category_name ?? c.name ?? "",
    ...String(c.sub_categories ?? "").split(","),
  ].filter((s) => s && s.trim());
}