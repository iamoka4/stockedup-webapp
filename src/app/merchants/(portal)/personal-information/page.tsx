"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getVendorInfo, updateVendorInfo, type VendorInfo } from "@/lib/api/vendor";
import { VendorIcon } from "@/components/vendor/icons";
import { errorMessage } from "@/components/vendor/ui";

// ─── Small pieces ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 ml-1 mt-6 text-[13px] font-bold uppercase tracking-wide text-gray-400 dark:text-ink-soft">
      {children}
    </h2>
  );
}

function InfoRow({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] dark:border-line py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#999] dark:text-ink-soft">{label}</p>
        <div className="mt-1 break-words text-[15px] font-semibold text-[#222] dark:text-ink">{children}</div>
      </div>
      {action}
    </div>
  );
}

const Value = ({ text }: { text?: string | null }) =>
  text?.trim() ? <>{text}</> : <span className="font-normal text-[#bbb] dark:text-ink-soft">Not set</span>;

const SoonBadge = () => (
  <span
    title="Coming soon"
    className="shrink-0 rounded-full bg-gray-100 dark:bg-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-gray-500 dark:text-ink-soft"
  >
    Contact support
  </span>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MerchantPersonalInformationPage() {
  const router = useRouter();

  const [info, setInfo] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setInfo(await getVendorInfo());
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(t);
  }, [saved]);

  function startEdit() {
    if (!info) return;
    setName(info.name);
    setAddress(info.shopAddress);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!info) return;
    const n = name.trim();
    const a = address.trim();
    if (n.length < 2) {
      setSaveError("Enter your full name.");
      return;
    }
    if (!a) {
      setSaveError("Enter your shop address.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      // Same fields get-vendor-info.php returns (logo excluded: images are saved from the Shop page).
      await updateVendorInfo({
        name: n,
        shop_name: info.shop_name,
        description: info.description,
        phoneNumber: info.phoneNumber,
        email: info.email,
        shopAddress: a,
        city: info.city,
        state: info.state,
      });
      setInfo({ ...info, name: n, shopAddress: a });
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    // -mb-24 / pb-24 lets the page background run behind the fixed tab bar.
    <div className="-mb-24 min-h-screen bg-[#f8f9fa] dark:bg-bg pb-24">
      {/* Header */}
      <div className="border-b border-[#f0f0f0] dark:border-line bg-white dark:bg-bg-raised px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-9 items-center justify-center rounded-full bg-[#f5f5f5] dark:bg-bg-elevated text-[#555] dark:text-ink-soft"
          >
            <VendorIcon name="arrowLeft" className="size-5" />
          </button>
          <h1 className="text-lg font-extrabold text-[#111] dark:text-ink">Personal Information</h1>
          <span className="w-9" />
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pb-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : loadError || !info ? (
          <div className="mt-8 rounded-2xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint p-5 text-center">
            <p role="alert" className="text-sm text-red-700 dark:text-clay">
              {loadError ?? "Could not load your information."}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="mt-3 rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Profile summary */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#e0e0e0] dark:border-line bg-white dark:bg-bg-raised p-4">
              {info.shop_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={info.shop_logo}
                  alt=""
                  className="size-[72px] shrink-0 rounded-full border-2 border-brand/20 object-cover"
                />
              ) : (
                <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand">
                  {(info.shop_name || info.name || "?").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-[#1a1a1a] dark:text-ink">
                  {info.name || "Merchant"}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-[#888] dark:text-ink-soft">{info.shop_name}</p>
              </div>
            </div>

            {saved && (
              <div
                role="status"
                className="mt-4 rounded-2xl border border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint px-4 py-3 text-sm font-semibold text-green-700 dark:text-leaf"
              >
                Your details have been updated.
              </div>
            )}
            {saveError && (
              <div
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-3 text-sm text-red-700 dark:text-clay"
              >
                {saveError}
              </div>
            )}

            {/* Personal */}
            <SectionLabel>Personal</SectionLabel>
            <div className="rounded-2xl border border-[#e0e0e0] dark:border-line bg-white dark:bg-bg-raised px-4">
              <InfoRow label="Full name">
                {editing ? (
                  <input
                    className="input w-full font-normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                ) : (
                  <Value text={info.name} />
                )}
              </InfoRow>
              <InfoRow label="Email address" action={<SoonBadge />}>
                <Value text={info.email} />
              </InfoRow>
              <InfoRow label="Phone number" action={<SoonBadge />}>
                <Value text={info.phoneNumber} />
              </InfoRow>
            </div>

            {/* Shop */}
            <SectionLabel>Shop</SectionLabel>
            <div className="rounded-2xl border border-[#e0e0e0] dark:border-line bg-white dark:bg-bg-raised px-4">
              <InfoRow label="Shop name">
                <Value text={info.shop_name} />
              </InfoRow>
              <InfoRow label="Shop address">
                {editing ? (
                  <input
                    className="input w-full font-normal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                  />
                ) : (
                  <Value text={info.shopAddress} />
                )}
              </InfoRow>
              <InfoRow label="City">
                <Value text={info.city} />
              </InfoRow>
              <InfoRow label="State">
                <Value text={info.state} />
              </InfoRow>
            </div>

            {/* Actions */}
            <div className="mt-6">
              {editing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="min-h-12 flex-1 rounded-[14px] bg-brand font-extrabold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="min-h-12 flex-1 rounded-[14px] border-2 border-brand bg-white dark:bg-bg-raised font-bold text-brand disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  className="min-h-12 w-full rounded-[14px] border-2 border-brand bg-white dark:bg-bg-raised font-bold text-brand"
                >
                  Edit details
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}