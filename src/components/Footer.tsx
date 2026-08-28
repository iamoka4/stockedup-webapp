import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

function FooterColumn({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/15 sm:border-none">
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
        <ChevronDown
          size={16}
          className="text-white/50 transition-transform duration-200 peer-checked:rotate-180 sm:hidden"
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
        {/* ── Brand block — one compact row, no longer center-stacked ── */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-block rounded-lg bg-white/95 px-3 py-1.5">
              <Image
                src="/weblogo.png"
                alt="StockedUp Africa"
                width={100}
                height={25}
                style={{ width: "auto", height: "25px" }}
              />
            </div>
            <p className="max-w-[220px] text-xs leading-snug text-white/80 sm:max-w-xs sm:text-sm">
              Foodstuff and groceries from vendors you know, delivered right at
              your doorstep.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.africa.stockedup"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-9 w-auto sm:h-10"
              />
            </a>

            <span
              aria-disabled="true"
              className="inline-flex flex-col items-start opacity-70"
              title="Coming soon"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store — coming soon"
                className="h-[34px] w-auto sm:h-9"
              />
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-white/70">
                Coming soon
              </span>
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15" />

        {/* ── Link columns — accordions on mobile, static grid from sm ── */}
        <div className="sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-5">
          <FooterColumn id="footer-shop" label="Shop">
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

          <FooterColumn id="footer-categories" label="Categories">
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

          <FooterColumn id="footer-policy" label="Policy">
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

          <FooterColumn id="footer-company" label="Company">
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

          <FooterColumn id="footer-affiliate" label="Affiliate">
            <p className="text-xs leading-relaxed text-white/80 sm:max-w-[180px]">
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
