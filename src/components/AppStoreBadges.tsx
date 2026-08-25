const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#";
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || "#";

/**
 * Store badges
 * Google Play uses its official multi-color Play logo.
 * Apple uses the official Apple logo treatment.
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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white transition-all hover:border-brand hover:shadow-sm"
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
    <svg
      width="17"
      height="17"
      viewBox="0 0 512 512"
      aria-hidden="true"
    >
      {/* Blue */}
      <path
        d="M25.1 20.6C17.9 28.3 14 40.1 14 55.9v400.2c0 15.8 3.9 27.6 11.1 35.3L264.4 256 25.1 20.6z"
        fill="#4285F4"
      />

      {/* Green */}
      <path
        d="M337.1 328.6 264.4 256 25.1 491.4c11.4 12.1 30.2 13.6 51.4 1.6l260.6-164.4z"
        fill="#34A853"
      />

      {/* Red */}
      <path
        d="M337.1 183.4 76.5 19C55.3 7 36.5 8.5 25.1 20.6L264.4 256l72.7-72.6z"
        fill="#EA4335"
      />

      {/* Yellow */}
      <path
        d="m337.1 183.4-72.7 72.6 72.7 72.6 89.3-56.3c25.4-16 25.4-43.6 0-59.6l-89.3-29.3z"
        fill="#FBBC04"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 384 512"
      aria-hidden="true"
      fill="#000000"
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.4 100.9c27.2-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.6-67.9 35.2-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.6z" />
    </svg>
  );
}