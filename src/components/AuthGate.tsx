"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";

// Shows its children only to logged-in users; everyone else gets a login
// prompt. This is a UI gate: the catalogue API itself is still public.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);
  const openRegister = useAuthModalStore((s) => s.openRegister);

  // AuthContext restores the cached user straight away, so returning users
  // see the shop immediately while their session is re-validated in the
  // background. If that check fails the user is cleared and the prompt appears.
  if (user) return <>{children}</>;

  // No cached user yet and the session check is still running: hold the
  // space instead of flashing the login prompt.
  if (isLoading) return <div className="min-h-[60vh]" aria-busy />;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden
        className="grid size-16 place-items-center rounded-full bg-brand-tint text-3xl"
      >
        🛒
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
        Log in to start shopping
      </h1>
      <p className="mt-3 text-ink-soft">
        Create an account or log in to browse food, groceries, supermarkets and
        local shops near you.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => openLogin()}
          className="rounded-full bg-brand px-8 py-3 font-bold text-white transition hover:bg-brand-deep"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => openRegister()}
          className="rounded-full border border-line px-8 py-3 font-bold text-ink transition hover:border-ink"
        >
          Create account
        </button>
      </div>
    </div>
  );
}