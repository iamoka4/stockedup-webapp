import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HOME_ROUTES as R } from "@/components/home/routes";

// lucide-react no longer exports brand/company logos, so these are small
// inline SVGs (20px, currentColor) that pick up the same text/hover classes.
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

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
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
      {/* Mobile: tap-to-expand accordion via a hidden checkbox (no JS).
          Desktop (sm+): checkbox/chevron hidden, content forced visible. */}
      <input type="checkbox" id={id} className="peer hidden" />
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 sm:cursor-default sm:py-0"
      >
        {label}
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

const LINK = "transition-colors hover:text-white";

const COLUMNS = [
  { id: "footer-shop", label: "Shop", order: 1, links: [
    ["Food", R.food], ["Groceries", R.groceries],
    ["Supermarkets", R.supermarkets], ["Local Shops", R.shops],
  ]},
  { id: "footer-business", label: "Business", order: 2, links: [
    ["Become a Merchant", R.merchants], ["Merchant Dashboard", R.merchants],
    ["Merchant Growth", R.merchantGrowth], ["Vendor Terms", "/vendor-terms"],
  ]},
  { id: "footer-delivery", label: "Delivery", order: 3, links: [
    ["KoulriaGo", "/riders#about-koulriago"], ["Become a Rider", "/riders"],
    ["Shipping Policy", "/shipping-policy"],
  ]},
  { id: "footer-company", label: "Company", order: 4, links: [
    ["About Us", "/about"], ["Careers", "/careers"], ["How It Works", R.howItWorks],
    ["Help Centre", R.help], ["Contact", "/contact"],
    ["Privacy", "/privacy"], ["Terms", "/terms"], ["Refer a Friend", "/referral"],
  ]},
  { id: "footer-policy", label: "Policy", order: 5, links: [
    ["Return Policy", "/return-policy"], ["Quality Guarantee", "/quality-guarantee"],
    ["Testimonials", "/testimonials"], ["FAQ", "/faq"],
  ]},
] as const;

const SOCIALS = [
  ["Instagram", "https://instagram.com/stockedupafrica", InstagramIcon],
  ["Facebook", "https://facebook.com/stockedupafrica", FacebookIcon],
  ["X (Twitter)", "https://twitter.com/stockedupafrica", XIcon],
  ["LinkedIn", "https://linkedin.com/company/stockedup-ltd/", LinkedInIcon],
  ["TikTok", "https://tiktok.com/@stockedupafrica", TikTokIcon],
] as const;

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-deep">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-row flex-wrap items-center justify-between gap-5 text-left">
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
            <p className="max-w-60 text-xs leading-snug text-white/80 sm:max-w-sm sm:text-sm">
              Food, groceries, supermarkets and other items from businesses you
              know, delivered to your doorstep by KoulriaGo.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Get the app
            </span>
            <div className="flex items-center gap-2">
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
                  className="h-10 w-auto sm:h-11"
                />
              </a>

              {/* App Store: not live yet, so a non-clickable "coming soon" badge.
                  Swap for a real link + Apple's official badge once it launches. */}
              <div
                role="img"
                aria-label="App Store, coming soon"
                className="flex h-8 cursor-default select-none items-center gap-1.5 rounded-md border border-white/40 bg-black px-2.5 text-white sm:h-9"
              >
                <AppleIcon size={20} />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase tracking-wide text-white/70">
                    Coming soon on the
                  </span>
                  <span className="mt-0.5 text-sm font-semibold sm:text-base">
                    App Store
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15" />

        <div className="flex flex-col sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-6">
          {COLUMNS.map((c) => (
            <FooterColumn key={c.id} id={c.id} label={c.label} order={c.order}>
              {c.links.map(([label, href]) => (
                <Link key={label} href={href} className={LINK}>
                  {label}
                </Link>
              ))}
            </FooterColumn>
          ))}

          <FooterColumn id="footer-socials" label="Socials" order={6}>
            <div className="flex items-center gap-4 pb-1">
              {SOCIALS.map(([name, href, Icon]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`StockedUp Africa on ${name}`}
                  className="text-white/85 transition-colors hover:text-orange-400"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-white/75 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} StockedUp Africa. All rights reserved.
          </span>
          <Link href="/cookies" className={LINK}>
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}