import { create } from "zustand";

type AuthModalView = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  setView: (view: AuthModalView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",
  openLogin: () => set({ isOpen: true, view: "login" }),
  openRegister: () => set({ isOpen: true, view: "register" }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));