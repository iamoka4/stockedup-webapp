"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUserAddresses, saveUserAddress } from "@/lib/api/addresses";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { ApiError } from "@/lib/api/client";

export default function AddressesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const openLogin = useAuthModalStore((s) => s.openLogin);
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
  if (!authLoading && !user) {
    openLogin("/account/addresses");
    router.replace("/");
  }
}, [authLoading, user, router, openLogin]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["addresses"],
    queryFn: getUserAddresses,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: () => saveUserAddress({ ...form, country: "NG" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setForm({ line1: "", line2: "", city: "", state: "", phone: "", is_default: false });
      setShowForm(false);
    },
  });

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Back to account
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Saved addresses</h1>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}

        {isError && (
          <p className="text-sm text-clay">
            {error instanceof ApiError ? error.message : "Couldn't load your saved addresses. Please try again."}
          </p>
        )}

        {!isLoading && !isError && data?.address.length === 0 && (
          <p className="text-sm text-ink-soft">You have no saved addresses yet.</p>
        )}

        {data?.address.map((addr) => (
          <div key={addr.id} className="rounded-2xl border border-line bg-bg-raised p-4 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{addr.line1}</p>
                {addr.line2 && <p className="text-ink-soft">{addr.line2}</p>}
                <p className="text-ink-soft">
                  {addr.city}, {addr.state}
                </p>
                {addr.phone && <p className="text-ink-soft">{addr.phone}</p>}
              </div>
              {!!addr.is_default && (
                <span className="stamp border-leaf text-leaf">Default</span>
              )}
            </div>
          </div>
        ))}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-2xl border border-dashed border-line py-3 text-sm font-medium text-brand-deep hover:border-brand"
          >
            + Add a new address
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="flex flex-col gap-2 rounded-2xl border border-line bg-bg-raised p-4"
          >
            <input
              required
              placeholder="Address line 1"
              value={form.line1}
              onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
              className="input"
            />
            <input
              placeholder="Address line 2 (optional)"
              value={form.line2}
              onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
              className="input"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="input"
              />
              <input
                required
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="input"
              />
            </div>
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input"
            />
            <label className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              />
              Set as default address
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 rounded-full bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
              >
                {mutation.isPending ? "Saving…" : "Save address"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-soft">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}