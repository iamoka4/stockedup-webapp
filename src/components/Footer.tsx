import Image from "next/image";
import Link from "next/link";

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
      {children}
    </span>
  );
}

function FooterColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <ColumnLabel>{label}</ColumnLabel>
      <div className="flex flex-col gap-2 text-sm text-white/85">
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-deep">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        {/* ── Brand block — centered on mobile, left-aligned from sm up ── */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="inline-block rounded-lg bg-white/95 px-3 py-1.5">
            <Image
              src="/weblogo.png"
              alt="StockedUp Africa"
              width={112}
              height={28}
              style={{ width: "auto", height: "28px" }}
            />
          </div>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/90">
            Foodstuff and groceries from vendors you know, delivered right at
            your doorstep.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
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
              className="inline-flex flex-col items-center opacity-70 sm:items-start"
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

        {/* ── Divider ── */}
        <div className="mt-10 border-t border-white/15" />

        {/* ── Link columns — 2-up on mobile, spreads out from md ── */}
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          <FooterColumn label="Shop">
            <Link href="/vendors" className="transition-colors hover:text-white">
              Vendors nearby
            </Link>
            <Link href="/categories" className="transition-colors hover:text-white">
              All categories
            </Link>
            <Link href="/how-it-works" className="transition-colors hover:text-white">
              How It Works
            </Link>
          </FooterColumn>

          <FooterColumn label="Categories">
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
          </FooterColumn>

          <FooterColumn label="Policy">
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
          </FooterColumn>

          <FooterColumn label="Company">
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
          </FooterColumn>

          {/* Affiliate spans both mobile columns so its blurb has room to breathe */}
          <div className="col-span-2 flex flex-col gap-2.5 sm:col-span-1">
            <ColumnLabel>Affiliate</ColumnLabel>
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
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/15 px-4 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-white/75 sm:flex-row sm:justify-between">
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
      </div>
    </footer>
  );
}