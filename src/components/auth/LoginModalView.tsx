"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

export function LoginModalView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const close = useAuthModalStore((s) => s.close);
  const setView = useAuthModalStore((s) => s.setView);
  const redirectTo = useAuthModalStore((s) => s.redirectTo);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      const target = redirectTo;
      close();
      if (target) router.push(target);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <Image src="/weblogo.png" alt="StockedUp Africa" width={128} height={32} style={{ width: "auto", height: "32px" }} />
      </div>

      <h2 className="font-display text-xl font-semibold text-ink">Sign in</h2>
      <p className="mt-1 text-sm text-ink-soft">Welcome back to StockedUp.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="Email address"
          autoComplete="email"
          className="input w-full"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="input w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="-mt-2 flex justify-end">
          <a href="/forgot-password" className="text-xs font-medium text-brand-deep hover:underline">
            Forgot password?
          </a>
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        Just browsing?{" "}
        <button type="button" onClick={close} className="font-semibold text-brand-deep hover:underline">
          Continue as guest
        </button>
      </p>

      <p className="mt-5 border-t border-line pt-5 text-center text-sm text-ink-soft">
        New on StockedUp?{" "}
        <button
          type="button"
          onClick={() => setView("register")}
          className="font-semibold text-brand-deep hover:underline"
        >
          Create account
        </button>
      </p>
    </div>
  );
}