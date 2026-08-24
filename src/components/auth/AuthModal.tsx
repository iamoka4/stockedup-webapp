"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuthModalStore } from "@/store/authModalStore";
import { LoginModalView } from "./LoginModalView";
import { RegisterModalView } from "./RegisterModalView";

export function AuthModal() {
  const isOpen = useAuthModalStore((s) => s.isOpen);
  const view = useAuthModalStore((s) => s.view);
  const close = useAuthModalStore((s) => s.close);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-bg-raised p-7 shadow-xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line hover:text-ink"
        >
          <X size={18} />
        </button>

        {view === "login" ? <LoginModalView /> : <RegisterModalView />}
      </div>
    </div>
  );
}