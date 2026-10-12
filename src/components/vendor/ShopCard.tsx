"use client";

import Link from "next/link";
import type { ShopProfile } from "@/lib/api/vendor";

export function ShopCard({ profile, href }: { profile: ShopProfile; href?: string }) {
  const name = profile.business_name || profile.shop_name || "Unnamed shop";

  const body = (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-bg-raised p-5">
      {profile.cover_photo && (
        <>
          {/* Cover photo, blurred, as the card background (same idea as the
              mobile app). Scaled up so the blur doesn't leave pale edges. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.cover_photo}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
          />
          {/* White wash so text stays readable on any photo. */}
          <div className="absolute inset-0 bg-white/60" />
        </>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="size-[72px] shrink-0 overflow-hidden rounded-full border-2 border-brand/30 bg-brand-tint">
            {profile.profile_pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_pic}
                alt={`${name} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full place-items-center text-3xl" aria-hidden>
                🏬
              </span>
            )}
          </div>

          {href && (
            <span className="rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand-deep">
              Edit shop ›
            </span>
          )}
        </div>

        <h2 className="mt-4 font-display text-xl font-bold">{name}</h2>

        {profile.location && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-soft">
            <span aria-hidden>📍</span>
            <span>{profile.location}</span>
          </p>
        )}

        {profile.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{profile.description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-ink-soft/70">
            No description added yet. Tap to edit.
          </p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition hover:opacity-90">
      {body}
    </Link>
  ) : (
    body
  );
}