"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserAddresses, saveUserAddress } from "@/lib/api/addresses";
import type { UserAddress } from "@/lib/api/types";

export function AddressPanel({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (address: UserAddress) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getUserAddresses,
  });

  const addresses = data?.address ?? [];

  if (isLoading) return <p className="text-sm text-ink-soft">Loading addresses…</p>;

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((addr) => (
        <label
          key={addr.id}
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm ${
            selectedId === addr.id ? "border-brand bg-brand-tint" : "border-line bg-bg-raised"
          }`}
        >
          <input
            type="radio"
            name="address"
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-ink">{addr.line1}</p>
            {addr.line2 && <p className="text-ink-soft">{addr.line2}</p>}
            <p className="text-ink-soft">
              {addr.city}, {addr.state}
            </p>
            {addr.phone && <p className="text-ink-soft">{addr.phone}</p>}
          </div>
        </label>
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
        <NewAddressForm
          onSaved={(addr) => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            onSelect(addr);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function NewAddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (a: UserAddress) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ line1: "", line2: "", city: "", state: "", phone: "" });

  const mutation = useMutation({
    mutationFn: () => saveUserAddress({ ...form, country: "NG" }),
    onSuccess: (res) => onSaved(res.address),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-bg-raised p-3"
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
      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-full bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {mutation.isPending ? "Saving…" : "Save address"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-ink-soft">
          Cancel
        </button>
      </div>
      {mutation.isError && <p className="text-sm text-clay">Couldn&apos;t save that address.</p>}
    </form>
  );
}
