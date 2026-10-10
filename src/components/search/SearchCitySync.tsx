"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/uiStore";

interface Props {
  /** The current search text (from the URL). */
  q: string;
  /** The city currently in the URL, if any. */
  urlCity?: string;
}

/**
 * The /search page is rendered on the server from the URL, but the selected
 * city lives in the browser (useUiStore, driven by the location dropdown).
 * This keeps the two in step:
 *  - arriving at /search with no city in the link -> use the picked city;
 *  - changing the city while on /search -> re-run the search for that city.
 * A link that already names a city is respected on arrival.
 */
export function SearchCitySync({ q, urlCity }: Props) {
  const router = useRouter();
  const city = useUiStore((s) => s.city);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!city || !q) return;

    if (firstRun.current) {
      firstRun.current = false;
      if (urlCity) return; // explicit city in the link wins on arrival
    }

    if (urlCity && urlCity.toLowerCase() === city.toLowerCase()) return;

    const params = new URLSearchParams({ q, city });
    router.replace(`/search?${params.toString()}`);
  }, [city, q, urlCity, router]);

  return null;
}