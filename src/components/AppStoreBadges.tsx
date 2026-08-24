const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#";
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || "#";

/**
 * Both URLs default to "#" until real store listing links are set in
 * .env.local (NEXT_PUBLIC_PLAY_STORE_URL / NEXT_PUBLIC_APP_STORE_URL) —
 * StockedUp isn't on the App Store yet per earlier context, so that one
 * may stay a placeholder for a while. Badges are shown in full color
 * regardless of link status; clicks are no-ops until real URLs are set.
 */
export function AppStoreBadges() {
  return (
    <div className="flex items-center gap-2">
      <StoreIcon href={PLAY_STORE_URL} label="Get it on Google Play">
        <PlayStoreIcon />
      </StoreIcon>
      <StoreIcon href={APP_STORE_URL} label="Download on the App Store">
        <AppleIcon />
      </StoreIcon>
    </div>
  );
}

function StoreIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const enabled = href !== "#";
  return (
    <a
      href={href}
      target={enabled ? "_blank" : undefined}
      rel={enabled ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={enabled ? label : `${label} (coming soon)`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:border-ink"
      onClick={(e) => {
        if (!enabled) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

function PlayStoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 512 512" fill="none" aria-hidden>
      <path
        d="M99 20c-9 5-15 14-15 26v420c0 12 6 21 15 26l232-236L99 20z"
        fill="currentColor"
      />
      <path d="M331 236 99 20l232 216z" fill="currentColor" opacity="0.7" />
      <path d="M331 276 99 492l232-216z" fill="currentColor" opacity="0.7" />
      <path
        d="M410 220l-59-33-64 69 64 69 59-33c19-11 19-61 0-72z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.4 100.9c27.2-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.6-67.9 35.2-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.6z" />
    </svg>
  );
}