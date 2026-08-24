import { create } from "zustand";

type AuthModalView = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  redirectTo: string | null;
  openLogin: (redirectTo?: string) => void;
  openRegister: (redirectTo?: string) => void;
  close: () => void;
  setView: (view: AuthModalView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",
  redirectTo: null,
  openLogin: (redirectTo) => set({ isOpen: true, view: "login", redirectTo: redirectTo ?? null }),
  openRegister: (redirectTo) => set({ isOpen: true, view: "register", redirectTo: redirectTo ?? null }),
  close: () => set({ isOpen: false, redirectTo: null }),
  setView: (view) => set({ view }),
}));