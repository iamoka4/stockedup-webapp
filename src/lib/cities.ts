/**
 * Mirrors the $supportedCities array in update_location.php exactly.
 * There's no dedicated "list supported cities" GET endpoint on the
 * backend — that file's array is the only canonical source we have, so
 * this is hardcoded to match it. If that array ever changes on the
 * backend, update this list too, or (better long-term) ask for a real
 * get-cities.php endpoint so this isn't duplicated logic.
 */
export interface City {
  value: string;
  label: string;
}

export const SUPPORTED_CITIES: City[] = [
  { value: "awka", label: "Awka" },
  { value: "nnewi", label: "Nnewi" },
  { value: "onitsha", label: "Onitsha" },
  { value: "oko", label: "Oko" },
  { value: "ekwulobia", label: "Ekwulobia" },
  { value: "enugu", label: "Enugu" },
  { value: "portharcourt", label: "Port Harcourt" },
  { value: "asaba", label: "Asaba" },
  { value: "warri", label: "Warri" },
  { value: "owerri", label: "Owerri" },
  { value: "aba", label: "Aba" },
  { value: "benin", label: "Benin" },
];

export function cityLabel(value: string): string {
  return SUPPORTED_CITIES.find((c) => c.value.toLowerCase() === value.toLowerCase())?.label ?? value;
}