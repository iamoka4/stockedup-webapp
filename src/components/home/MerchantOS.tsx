import Image from "next/image";
import Link from "next/link";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.africa.stockedup";

const FEATURES = [
  ["📦", "Products & inventory", "Manage what you sell and what's in stock."],
  ["🧾", "Orders & sales", "Track every order from new to delivered."],
  ["👥", "Customers", "Know who buys from you and how often."],
  ["💳", "Wallet & payments", "See your earnings and withdraw to your bank."],
  ["📊", "Business analytics", "Revenue, orders and acceptance rate at a glance."],
  ["🏬", "Store management", "Keep your store, listings and hours up to date."],
  ["🏷️", "Promotions", "Run discounts and offers in a few taps."],
  ["📈", "Performance insights", "Clear numbers to guide your next move."],
] as const;

// Real screens from the merchant app, in order. Files live in
// public/home/merchant-steps/step-1.png ... step-9.png (crop to the phone
// screen only, and blur any real phone/email before publishing).
const STEPS = [
  {
    title: "Open the app",
    text: "Download StockedUp and tap Become a Merchant on the welcome screen.",
  },
  {
    title: "Choose what you sell",
    text: "Pick Grocery, Restaurant or Supermarket, then enter your name and email.",
  },
  {
    title: "Add your business details",
    text: "Enter your phone number, shop name, business address, city and state.",
  },
  {
    title: "Secure your account",
    text: "Create a password, accept the Terms and Privacy Policy, then tap Continue.",
  },
  {
    title: "Land on your dashboard",
    text: "Your sales, orders, rating and store status are all in one place.",
  },
  {
    title: "Set up your shop profile",
    text: "Add a cover photo and profile picture, then your store name and description.",
  },
  {
    title: "Add contact and location",
    text: "Enter your contact details and the shop address where orders are picked up.",
  },
  {
    title: "Save your profile",
    text: "CAC and Tax ID are optional. Tap Save Profile & Continue and our team reviews your details.",
  },
  {
    title: "Add your products",
    text: "Open the Shop tab, tap Add Product and start selling to customers near you.",
  },
] as const;

/* ───────── Phone mockups, modelled on the real merchant app ─────────
   All figures are made-up sample data (never real merchant data). */

function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-4xl border-4 border-ink bg-ink shadow-2xl shadow-brand-deep/25 ${className}`}
    >
      <div className="h-full overflow-hidden rounded-3xl bg-bg text-[10px] text-ink">
        {children}
      </div>
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-b-2xl bg-brand px-3 pt-4 pb-9 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="opacity-80">Hello</div>
            <b className="text-xs">Your Store</b>
          </div>
          <span className="grid size-6 place-items-center rounded-full bg-white/25">🔔</span>
        </div>
      </div>
      <div className="-mt-7 mx-3 rounded-2xl bg-brand-deep p-3 text-white shadow-lg">
        <div className="opacity-80">Total Sales</div>
        <b className="tabular text-lg">₦184,000</b>
        <div className="mt-2 grid grid-cols-2 rounded-xl bg-black/15 py-1.5 text-center">
          <div>
            <div className="opacity-75">Total Orders</div>
            <b className="tabular">46</b>
          </div>
          <div>
            <div className="opacity-75">Completed</div>
            <b className="tabular">44</b>
          </div>
        </div>
      </div>
      <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
        {[
          ["📋", "46", "Total Orders"],
          ["⏱️", "2", "Pending"],
          ["📦", "0", "Declined"],
          ["⭐", "4.8", "Rating"],
        ].map(([i, v, l]) => (
          <div key={l} className="rounded-xl border border-line bg-bg-raised py-2 text-center">
            <div>{i}</div>
            <b className="tabular text-xs">{v}</b>
            <div className="text-ink-soft">{l}</div>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-3 font-bold">Quick Actions</div>
      <div className="mx-3 mt-1.5 flex gap-2">
        {["📦", "🧾", "📊", "👛"].map((i) => (
          <span key={i} className="grid size-8 place-items-center rounded-full bg-brand-tint">
            {i}
          </span>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-4 border-t border-line bg-bg-raised py-2 text-center text-ink-soft">
        {["Home", "Shop", "Orders", "Menu"].map((n, i) => (
          <span key={n} className={i === 0 ? "font-bold text-brand-deep" : ""}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const tiles = [
    ["Total Revenue", "₦184,000", "border-leaf"],
    ["Total Orders", "46", "border-indigo"],
    ["Avg Order Value", "₦4,000", "border-clay"],
    ["Acceptance Rate", "96%", "border-brand"],
  ];
  const bars = [8, 12, 10, 18, 14, 30, 46, 22, 16, 20, 12, 14];
  return (
    <div>
      <div className="bg-brand px-3 py-3 text-white">
        <b className="text-xs">Analytics &amp; Reports</b>
        <div className="opacity-80">Real-time business insights</div>
      </div>
      <div className="mx-3 mt-2 grid grid-cols-4 rounded-xl bg-bg-raised p-1 text-center text-[8px] shadow-sm">
        {["Today", "This Week", "This Month", "All Time"].map((t, i) => (
          <span
            key={t}
            className={`rounded-lg py-1 ${i === 3 ? "bg-brand font-bold text-white" : ""}`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mx-3 mt-2 grid grid-cols-2 gap-2">
        {tiles.map(([l, v, b]) => (
          <div key={l} className={`rounded-xl border-l-4 bg-bg-raised p-2 shadow-sm ${b}`}>
            <b className="tabular text-xs">{v}</b>
            <div className="text-ink-soft">{l}</div>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-2 rounded-xl bg-bg-raised p-2 shadow-sm">
        <b>Monthly Revenue</b>
        <div className="mt-2 flex h-14 items-end gap-1">
          {bars.map((h, i) => (
            <i
              key={i}
              style={{ height: `${h * 2}%` }}
              className="flex-1 rounded-t bg-brand/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletScreen() {
  return (
    <div className="px-3 pt-3">
      <b className="text-xs">Wallet</b>
      <div className="mt-2 rounded-2xl bg-brand p-3 text-white">
        <div className="opacity-80">Available Balance</div>
        <b className="tabular text-lg">₦24,500.00</b>
        <div className="mt-2 grid grid-cols-2 rounded-xl bg-black/15 py-1.5 text-center">
          <div>
            <div className="opacity-75">Total Earned</div>
            <b className="tabular">₦184,000</b>
          </div>
          <div>
            <div className="opacity-75">Pending</div>
            <b className="tabular">₦0.00</b>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-center font-bold">
          <span className="rounded-full bg-white/25 py-1.5">Withdraw</span>
          <span className="rounded-full bg-white py-1.5 text-brand-deep">Update Bank</span>
        </div>
      </div>
      <b className="mt-3 block">Transaction History</b>
      <div className="mt-1.5 space-y-1.5">
        {[
          ["Withdrawal — COMPLETED", "-₦20,000"],
          ["Withdrawal — COMPLETED", "-₦15,500"],
          ["Withdrawal — COMPLETED", "-₦5,000"],
        ].map(([t, a], i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-bg-raised p-2 shadow-sm"
          >
            <span>{t}</span>
            <b className="tabular text-clay">{a}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMocks() {
  return (
    <div aria-hidden className="relative mx-auto h-136 w-full max-w-lg">
      <Phone className="absolute top-10 left-0 hidden h-104 w-48 -rotate-6 sm:block">
        <AnalyticsScreen />
      </Phone>
      <Phone className="absolute top-14 right-0 hidden h-104 w-48 rotate-6 sm:block">
        <WalletScreen />
      </Phone>
      <Phone className="absolute top-0 left-1/2 z-10 h-120 w-56 -translate-x-1/2">
        <HomeScreen />
      </Phone>
      <span className="stamp absolute bottom-0 left-1/2 -translate-x-1/2 bg-bg text-ink-soft">
        Sample data
      </span>
    </div>
  );
}

/* ───────── Step-by-step: creating a merchant account ───────── */

function RegisterSteps({ className = "" }: { className?: string }) {
  return (
    <div id="how-to-register" className={`scroll-mt-28 ${className}`}>
      <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Create your merchant account
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
        Nine quick steps from download to your first product. Swipe through to
        see each screen.
      </p>

      <ol className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-6">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="w-60 shrink-0 snap-start rounded-3xl border border-line bg-bg-raised p-5"
          >
            <span className="tabular text-4xl font-semibold text-brand">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="relative mt-3 aspect-[9/20] overflow-hidden rounded-2xl border-4 border-ink bg-bg">
              <Image
                src={`/home/merchant-steps/step-${i + 1}.png`}
                alt={`Step ${i + 1}: ${s.title}`}
                fill
                sizes="240px"
                className="object-cover object-top"
              />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The steps as their own page section, so the page can place other sections
// (e.g. MerchantGrowth) before it.
export function MerchantSteps() {
  return (
    <section className="pt-20 pb-4 md:pt-28">
      <div className="mx-auto max-w-6xl px-6">
        <RegisterSteps />
      </div>
    </section>
  );
}

export function MerchantOS({
  asPageTitle = false,
  showSteps = true,
}: {
  asPageTitle?: boolean;
  /** Set false to render the steps separately with <MerchantSteps />. */
  showSteps?: boolean;
}) {
  const Heading = asPageTitle ? "h1" : "h2";
  return (
    <section id="merchants" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Heading className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Built for local businesses.
            </Heading>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              StockedUp gives businesses the tools they need to sell online,
              manage their operations and understand their customers.
            </p>
            <Link
              href="#how-to-register"
              className="mt-8 inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
            >
              Quick guide to become a merchant
            </Link>
          </div>
          <PhoneMocks />
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, text]) => (
            <li
              key={title}
              className="rounded-3xl border border-line bg-bg-raised p-6 transition duration-200 hover:-translate-y-1 hover:border-brand"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-brand-tint text-xl">
                {icon}
              </span>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>

        {showSteps && <RegisterSteps className="mt-20" />}
      </div>
    </section>
  );
}