import Link from "next/link";

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-deep">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-7">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="font-display text-lg font-semibold text-white">
            StockedUp Africa
          </span>

          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/90">
            Foodstuff and groceries from vendors you know, delivered across Awka.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
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
                className="h-11 w-auto"
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
                className="h-10 w-auto"
              />
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/75">
                Coming soon
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/85">
          <ColumnLabel>Shop</ColumnLabel>
          <Link href="/vendors" className="transition-colors hover:text-white">
            Vendors nearby
          </Link>
          <Link href="/categories" className="transition-colors hover:text-white">
            All categories
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-white">
            How It Works
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/85">
          <ColumnLabel>Categories</ColumnLabel>
          <Link href="/categories" className="transition-colors hover:text-white">
            Groceries & Foodstuffs
          </Link>
          <Link href="/categories" className="transition-colors hover:text-white">
            Canned Foods
          </Link>
          <Link href="/categories" className="transition-colors hover:text-white">
            Fresh Vegetables
          </Link>
          <Link href="/categories" className="transition-colors hover:text-white">
            Flour & Grains
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/85">
          <ColumnLabel>Policy</ColumnLabel>
          <Link href="/return-policy" className="transition-colors hover:text-white">
            Return Policy
          </Link>
          <Link href="/shipping-policy" className="transition-colors hover:text-white">
            Shipping Policy
          </Link>
          <Link href="/quality-guarantee" className="transition-colors hover:text-white">
            Quality Guarantee
          </Link>
          <Link href="/vendor-terms" className="transition-colors hover:text-white">
            Vendor Terms
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/85">
          <ColumnLabel>Company</ColumnLabel>
          <Link href="/about" className="transition-colors hover:text-white">
            About Us
          </Link>
          <Link href="/offer" className="transition-colors hover:text-white">
            Our Offer
          </Link>
          <Link href="/testimonials" className="transition-colors hover:text-white">
            Testimonials
          </Link>
          <Link href="/contact" className="transition-colors hover:text-white">
            Contact Us
          </Link>
          <Link href="/faq" className="transition-colors hover:text-white">
            FAQ
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/85">
          <ColumnLabel>Affiliate</ColumnLabel>
          <p className="text-xs leading-relaxed text-white/80">
            Refer a friend — you earn, they get a discount on their first order.
          </p>
          <Link
            href="/referral"
            className="inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-white/80"
          >
            Start referring →
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-white/20 px-4 py-5 text-xs text-white/75 sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} StockedUp Africa. All rights reserved.
        </span>

        <div className="flex items-center gap-5">
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of Service
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-white">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}