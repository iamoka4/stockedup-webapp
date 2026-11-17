import { apiGet } from "./client";
import type { Product } from "./types";

export async function getChristmasBundles(opts: {
  city?: string;
  all?: boolean;
}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (opts.city) q.set("city", opts.city);
  if (opts.all) q.set("all", "1");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await apiGet(`/get-christmas-bundles.php?${q.toString()}`);
  if (Array.isArray(res)) return res as Product[];
  return (Array.isArray(res?.data) ? res.data : []) as Product[];
}