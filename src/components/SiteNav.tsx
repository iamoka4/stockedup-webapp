import Link from "next/link";
import { HOME_ROUTES } from "@/components/home/routes";

// Shared by the desktop nav row below and MobileMenu.
export const NAV_LINKS = [
  { label: "How It Works", href: HOME_ROUTES.howItWorks },
  { label: "Food", href: HOME_ROUTES.food },
  { label: "Groceries", href: HOME_ROUTES.groceries },
  { label: "Supermarkets", href: HOME_ROUTES.supermarkets },
  { label: "For Riders", href: HOME_ROUTES.riders },
  { label: "Help", href: HOME_ROUTES.help },
] as const;

// Desktop only. Sits inside <header> so it stays sticky with the top row.
export function SiteNav() {
  return (
    <nav
      aria-label="Main"
      className="hidden border-t border-line md:block"
    >
      <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-sm font-medium text-ink">
        {NAV_LINKS.map((l) => (
          <li key={l.label} className="shrink-0">
            <Link
              href={l.href}
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-brand-tint hover:text-brand-deep"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}