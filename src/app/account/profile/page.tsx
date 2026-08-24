"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";
export default function ProfilePage() {
  const { user, isLoading: authLoading, setUser } = useAuth();
  const router = useRouter();
  const { openLogin } = useAuthModalStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
  if (!authLoading && !user) {
    openLogin("/account/profile");
    router.replace("/");
  }
}, [authLoading, user, router, openLogin]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!user) return;

  setError(null);
  setSuccessMessage(null);
  setSubmitting(true);

  try {
    const result = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });

    setUser({
      ...user,
      first_name: result.first_name,
      last_name: result.last_name,
      email: result.email,
      phone: result.phone,
    });

    setSuccessMessage("Profile updated successfully");
  } catch (err) {
    setError(err instanceof ApiError ? err.message : "Failed to update profile. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">Profile Detail</h1>
      <p className="mt-1 text-sm text-ink-soft">Update your personal information</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-ink">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              maxLength={100}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-ink">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              maxLength={100}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-ink">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="081-0443-6235"
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}
        {successMessage && <p className="text-sm text-leaf">{successMessage}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-fit"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}