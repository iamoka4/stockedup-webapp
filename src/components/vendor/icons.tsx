import type { ReactNode } from "react";

const PATHS = {
  // Tab bar
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  shop: (
    <>
      <path d="M4 9l1.5-5h13L20 9" />
      <path d="M4 9a3 3 0 0 0 5.3 1.9A3 3 0 0 0 14.7 10.9 3 3 0 0 0 20 9" />
      <path d="M5 13v8h14v-8M10 21v-5h4v5" />
    </>
  ),
  orders: (
    <>
      <path d="M5 8h14l-1 13H6z" />
      <path d="M9 8a3 3 0 0 1 6 0M10 14h4" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,

  // Menu, home and notifications screens
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  package: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  packagePlus: (
    <>
      <path d="M20 11V8l-8-5-8 5v8l8 5 3-1.9" />
      <path d="M4 8l8 5 8-5M12 13v8" />
      <path d="M19 15v6M16 18h6" />
    </>
  ),
  packageEmpty: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 12h6M9 16h6" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
      <path d="M9 7h6M9 11h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  trending: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  barChart: (
    <>
      <path d="M3 21h18" />
      <rect x="5" y="14" width="3" height="7" rx="0.6" />
      <rect x="10.5" y="9" width="3" height="12" rx="0.6" />
      <rect x="16" y="4" width="3" height="17" rx="0.6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a7 7 0 0 1 4 6" />
    </>
  ),
  location: (
    <>
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
    </>
  ),
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />,
  bellOff: <path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H6M10 21h4M3 3l18 18" />,
  tag: (
    <>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  bagPlus: (
    <>
      <path d="M5 8h14l-1 13H6z" />
      <path d="M9 8a3 3 0 0 1 6 0M12 12v5M9.5 14.5h5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L21 7H6" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  logout: (
    <>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M16 8l4 4-4 4M20 12H9" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>;

export type VendorIconName = keyof typeof PATHS;

export function VendorIcon({
  name,
  className = "size-6",
  strokeWidth = 1.9,
  fill = false,
}: {
  name: VendorIconName;
  className?: string;
  strokeWidth?: number;
  /** Solid version of the symbol (e.g. the filled bell when there are unread notifications). */
  fill?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}