"use client";

import { useEffect, useState } from "react";
import { saveShopProfile, type ShopProfile } from "@/lib/api/vendor";
import { findCityFromText, normalizeCityKey } from "@/lib/vendor/cities";
import { prepareImage, validateImageFile } from "@/lib/vendor/image";
import { ErrorBanner, Field, PrimaryButton, errorMessage } from "./ui";

function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

/** store_location is saved as "address, city, state"; recover just the address. */
function addressFrom(profile: ShopProfile): string {
  const loc = (profile.location ?? "").trim();
  if (!loc) return profile.store_address ?? "";
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  const tail = [profile.state, profile.city]
    .map((s) => normalizeCityKey(s ?? ""))
    .filter(Boolean);
  while (parts.length > 1 && tail.includes(normalizeCityKey(parts[parts.length - 1]))) {
    parts.pop();
  }
  return parts.join(", ");
}

export function ProfileStep({
  profile,
  onSaved,
  submitLabel = "Save profile & continue",
}: {
  profile: ShopProfile;
  onSaved: () => void;
  /** Button text. Onboarding keeps the default; the edit page passes "Save changes". */
  submitLabel?: string;
}) {
  const cityInfo = findCityFromText(profile.city ?? "");
  const cityLabel = cityInfo?.label ?? profile.city ?? "";
  const stateName = profile.state || cityInfo?.state || "";
  const email = profile.email ?? profile.owner?.email ?? "";

  const [storeName, setStoreName] = useState(profile.business_name ?? profile.shop_name ?? "");
  const [description, setDescription] = useState(profile.description ?? "");
  const [phone, setPhone] = useState(
    (profile.phone_number ?? profile.owner?.phone ?? "").replace(/\D/g, "")
  );
  const [address, setAddress] = useState(addressFrom(profile));
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const logoPreview = useObjectUrl(logo) ?? profile.profile_pic ?? null;
  const coverPreview = useObjectUrl(cover) ?? profile.cover_photo ?? null;

  function pick(kind: "logo" | "cover", file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    if (kind === "logo") setLogo(file);
    else setCover(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errs: Record<string, string> = {};
    if (!storeName.trim()) errs.storeName = "Please enter your store name";
    if (!description.trim()) errs.description = "Please enter a store description";
    if (!address.trim()) errs.address = "Please enter your shop address";
    if (!/^0\d{10}$/.test(phone)) errs.phone = "Enter a valid phone number (e.g., 08012345678)";
    if (!email) errs.email = "Your account has no email on file. Please contact support.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      const [logoFile, coverFile] = await Promise.all([
        logo ? prepareImage(logo, 1200) : Promise.resolve(undefined),
        cover ? prepareImage(cover, 1920) : Promise.resolve(undefined),
      ]);
      await saveShopProfile({
        storeName: storeName.trim(),
        description: description.trim(),
        location: [address.trim(), cityLabel, stateName].filter(Boolean).join(", "),
        phoneNumber: phone,
        email,
        logo: logoFile,
        cover: coverFile,
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      // Reset on success too: on the edit page the form stays mounted.
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8" noValidate>
      <ErrorBanner message={error} />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold">Shop images (optional)</h2>

        <label className="relative block h-44 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-line bg-bg">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="Cover photo" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center px-4 text-center text-sm text-ink-soft">
              Add a cover photo, shown at the top of your shop page
            </span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => pick("cover", e.target.files?.[0])}
          />
        </label>

        <div className="flex items-center gap-4">
          <label className="relative block size-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-line bg-bg">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Profile picture" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-xs text-ink-soft">Logo</span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => pick("logo", e.target.files?.[0])}
            />
          </label>
          <p className="text-sm text-ink-soft">
            Profile picture: tap the circle to {logoPreview ? "change" : "add"} your logo.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Store information</h2>
        <Field label="Store name *" error={fieldErrors.storeName}>
          <input
            className="input w-full"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </Field>
        <Field label="Store description *" error={fieldErrors.description}>
          <textarea
            className="input w-full"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your store..."
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Contact information</h2>
        <Field label="Phone number *" error={fieldErrors.phone}>
          <input
            className="input w-full"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="08012345678"
          />
        </Field>
        <Field label="Email address" error={fieldErrors.email} hint="Your login email can't be changed here.">
          <input className="input w-full" value={email} readOnly />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Shop location</h2>
        <p className="rounded-2xl bg-brand-tint px-4 py-3 text-sm">
          This is where our staff will come to pick up your orders.
        </p>
        <Field label="Shop address *" error={fieldErrors.address}>
          <input
            className="input w-full"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Zik Avenue"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <input className="input w-full" value={cityLabel} readOnly />
          </Field>
          <Field label="State">
            <input className="input w-full" value={stateName} readOnly />
          </Field>
        </div>
      </section>

      <PrimaryButton type="submit" busy={busy}>
        {submitLabel}
      </PrimaryButton>
    </form>
  );
}