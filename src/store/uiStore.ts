import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  /** Lowercase city key (e.g. "awka", "portharcourt") — matches SUPPORTED_CITIES values. */
  city: string;
  setCity: (city: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      city: "awka",
      setCity: (city) => set({ city }),
    }),
    { name: "stockedup_ui" }
  )
);