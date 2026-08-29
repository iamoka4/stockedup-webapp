import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// lucide-react no longer exports brand/company logos (Instagram, Facebook,
// Twitter/X, etc.) — those were removed from the core icon set in a recent
// version since they're trademarked logos, not generic icons. Small inline
// SVGs instead, sized to match how the lucide icons were being used (20px,
// currentColor so they pick up the same text-color/hover classes).
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.9L4.8 22H1.7l8.1-9.3L1 2h7.1l4.9 6.3zm-1.2 18h1.9L7.4 4h-2z" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M6.94 8.5H3.56V21H6.94V8.5ZM5.25 3C4.01 3 3 4.01 3 5.25C3 6.49 4.01 7.5 5.25 7.5C6.49 7.5 7.5 6.49 7.5 5.25C7.5 4.01 6.49 3 5.25 3ZM20.5 21H17.13V14.6C17.13 13.06 17.1 11.08 15 11.08C12.86 11.08 12.53 12.76 12.53 14.49V21H9.16V8.5H12.4V10.05H12.44C12.9 9.19 14.01 8.28 15.67 8.28C19.08 8.28 20.5 10.52 20.5 14.19V21Z" />
    </svg>
  );
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
    </svg>
  );
}

function FooterColumn({
  id,
  label,
  children,
  order,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  order?: number;
}) {
  return (
    <div
      className="border-b border-white/15 sm:order-0 sm:border-none"
      style={order ? { order } : undefined}
    >
      {/* Mobile: tap-to-expand accordion via a hidden checkbox — no JS needed.
          Desktop (sm+): the checkbox/chevron are hidden and content is
          forced visible, so it renders as a normal static column exactly
          like before. */}
      <input type="checkbox" id={id} className="peer hidden" />
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 sm:cursor-default sm:py-0"
      >
        {label}
        {/* Plus/chevron toggle — rotates into an "x"-ish state via rotation
            when expanded, matching the reference's +/expand affordance. */}
        <ChevronDown
          size={16}
          className="text-orange-400 transition-transform duration-200 peer-checked:rotate-180 sm:hidden"
        />
      </label>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out peer-checked:grid-rows-[1fr] sm:mt-3 sm:grid-rows-[1fr]">
        <div className="flex flex-col gap-2.5 overflow-hidden text-sm text-white/85 sm:overflow-visible">
          <div className="flex flex-col gap-2.5 pb-4 sm:pb-0 sm:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-deep">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* ── Brand block ── */}
        <div className="flex flex-row flex-wrap items-center gap-5 text-left">
          <div className="flex flex-row items-center gap-3">
            <div className="inline-block rounded-lg bg-white/95 px-3 py-1.5">
              <Image
                src="/weblogo.png"
                alt="StockedUp Africa"
                width={100}
                height={25}
                style={{ width: "auto", height: "25px" }}
              />
            </div>
            <p className="max-w-60 text-xs leading-snug text-white/80 sm:max-w-xs sm:text-sm">
              Foodstuff and groceries from vendors you know, delivered right at
              your doorstep.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15" />

        {/* ── Link columns ──
            Mobile: flex-col with `order-*` so Categories/Policy/Company/
            Socials come first (matching the reference), Shop/Affiliate
            follow. Desktop (sm+): order resets to none, so the grid keeps
            its original left-to-right DOM order (Shop, Categories, Policy,
            Company, Affiliate, Socials — Socials wraps to a second row in
            the 5-col grid since it's new content with nowhere else to go;
            bump lg:grid-cols-5 to 6 if you'd rather it fit on one row). */}
        <div className="flex flex-col sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-5">
          <FooterColumn id="footer-shop" label="Shop" order={5}>
            <Link
              href="/vendors"
              className="transition-colors hover:text-white"
            >
              Vendors nearby
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              All categories
            </Link>
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-white"
            >
              How It Works
            </Link>
          </FooterColumn>

          <FooterColumn id="footer-categories" label="Categories" order={1}>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              Groceries & Foodstuffs
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              Canned Foods
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              Fresh Vegetables
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              Flour & Grains
            </Link>
          </FooterColumn>

          <FooterColumn id="footer-policy" label="Policy" order={2}>
            <Link
              href="/return-policy"
              className="transition-colors hover:text-white"
            >
              Return Policy
            </Link>
            <Link
              href="/shipping-policy"
              className="transition-colors hover:text-white"
            >
              Shipping Policy
            </Link>
            <Link
              href="/quality-guarantee"
              className="transition-colors hover:text-white"
            >
              Quality Guarantee
            </Link>
            <Link
              href="/vendor-terms"
              className="transition-colors hover:text-white"
            >
              Vendor Terms
            </Link>
          </FooterColumn>

          <FooterColumn id="footer-company" label="Company" order={3}>
            <Link href="/about" className="transition-colors hover:text-white">
              About Us
            </Link>
            <Link href="/offer" className="transition-colors hover:text-white">
              Our Offer
            </Link>
            <Link
              href="/testimonials"
              className="transition-colors hover:text-white"
            >
              Testimonials
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-white"
            >
              Contact Us
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </FooterColumn>

          <FooterColumn id="footer-affiliate" label="Affiliate" order={6}>
            <p className="text-xs leading-relaxed text-white/80 sm:max-w-45">
              Refer a friend — you earn, they get a discount on their first
              order.
            </p>
            <Link
              href="/referral"
              className="inline-flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-white/80"
            >
              Start referring →
            </Link>
          </FooterColumn>

          {/* NEW — Socials. Placeholder hrefs: swap in your real profile
              URLs before shipping. */}
          <FooterColumn id="footer-socials" label="Socials" order={4}>
            <div className="flex items-center gap-4 pb-1">
              <a
                href="https://instagram.com/stockedupafrica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StockedUp Africa on Instagram"
                className="text-white/85 transition-colors hover:text-orange-400"
              >
                <InstagramIcon size={20} />
              </a>
              <a
                href="https://facebook.com/stockedupafrica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StockedUp Africa on Facebook"
                className="text-white/85 transition-colors hover:text-orange-400"
              >
                <FacebookIcon size={20} />
              </a>
              <a
                href="https://twitter.com/stockedupafrica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StockedUp Africa on X (Twitter)"
                className="text-white/85 transition-colors hover:text-orange-400"
              >
                <XIcon size={20} />
              </a>
              <a
                href="https://linkedin.com/company/stockedupafrica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StockedUp Africa on LinkedIn"
                className="text-white/85 transition-colors hover:text-orange-400"
              >
                <LinkedInIcon size={20} />
              </a>
              <a
                href="https://tiktok.com/@stockedupafrica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StockedUp Africa on TikTok"
                className="text-white/85 transition-colors hover:text-orange-400"
              >
                <TikTokIcon size={20} />
              </a>
            </div>
          </FooterColumn>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/15 px-4 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-white/75 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} StockedUp Africa. All rights reserved.
          </span>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}