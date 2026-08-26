// components/home/OfferSection.tsx
import {
  ShoppingBag,
  Truck,
  Salad,
  PackageOpen,
  Wheat,
  LayoutDashboard,
} from "lucide-react";

const OFFERS = [
  {
    icon: ShoppingBag,
    title: "Groceries & Foodstuffs",
    body: "Rice, beans, cooking oil, spices and every staple you need — sourced fresh from local vendors.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    body: "Track your order in real time. Our logistics partners bring it straight to you.",
    featured: true,
    badge: "Live tracking",
  },
  {
    icon: Salad,
    title: "Fresh Vegetables",
    body: "Tomatoes, ugu, garden eggs, peppers — straight from the farm, not from storage.",
  },
  {
    icon: PackageOpen,
    title: "Canned Foods",
    body: "Your favourite packaged and canned essentials, stocked and ready to order.",
  },
  {
    icon: Wheat,
    title: "Flour & Grains",
    body: "Semolina, wheat flour, garri, millet — bulk or small portions, always available.",
  },
  {
    icon: LayoutDashboard,
    title: "Customer Dashboard",
    body: "Manage orders, track deliveries, view history and redeem loyalty points in one place.",
  },
];

// Same four-color thread used on the About page's Values cards —
// keeps the two pages feeling like one product, not two designs.
const ACCENTS = ["bg-brand", "bg-leaf", "bg-indigo", "bg-clay"];

export function OfferSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-deep via-brand-deep to-ink px-6 py-16 sm:px-10 sm:py-20">
      {/* ambient depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-104 w-104 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 -translate-y-1/4 rounded-full bg-leaf/25 blur-3xl"
      />
      {/* fine texture so the gradient doesn't read flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mb-4 text-center">
        <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white">
          What we offer
        </span>
        <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          Everything from
          <br />
          the{" "}
          <span className="relative inline-block">
            <em className="italic text-leaf">market</em>
            <svg
              aria-hidden="true"
              viewBox="0 0 120 14"
              className="absolute -bottom-1.5 left-0 h-3 w-full text-leaf"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9c15-8 27-8 40-2s28 8 40 2 25-6 36 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          , online
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-white/80">
          One platform for the staples, fresh produce and delivery you&apos;d
          normally piece together across town.
        </p>
      </div>

      <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((offer, i) => {
          const Icon = offer.icon;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div
              key={offer.title}
              className={`group relative rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                offer.featured
                  ? "border-leaf bg-leaf shadow-lg shadow-leaf/30"
                  : "border-white/15 bg-white/10 backdrop-blur-sm hover:border-white/25 hover:bg-white/15"
              }`}
            >
              {offer.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {offer.badge}
                </span>
              )}

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 ${
                  offer.featured
                    ? "bg-white/25 group-hover:translate-x-1"
                    : accent
                }`}
              >
                <Icon size={22} strokeWidth={1.75} className="text-white" />
              </div>
              <h4 className="font-display text-base font-bold text-white">
                {offer.title}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                {offer.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}