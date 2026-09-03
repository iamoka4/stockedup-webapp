import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 100;

interface UiState {
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  /** Lowercase city key (e.g. "awka", "portharcourt") — matches SUPPORTED_CITIES values. */
  city: string;
  setCity: (city: string) => void;
  /** Product IDs (as strings) the user has viewed, most recent last — mirrors mobile's Zustand browsingHistory. */
  browsingHistory: string[];
  addToBrowsingHistory: (productId: string | number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      city: "awka",
      setCity: (city) => set({ city }),
      browsingHistory: [],
      addToBrowsingHistory: (productId) =>
        set((state) => {
          const id = productId.toString();
          const withoutDupe = state.browsingHistory.filter((existing) => existing !== id);
          return { browsingHistory: [...withoutDupe, id].slice(-MAX_HISTORY) };
        }),
    }),
    { name: "stockedup_ui" }
  )
);