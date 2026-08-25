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

export function OfferSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-deep via-brand-deep to-brand-deep/85 px-6 py-16 sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-104 w-104 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 -translate-y-1/4 rounded-full bg-leaf/25 blur-3xl"
      />

      <div className="relative mb-4 text-center">
        <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white">
          What we offer
        </span>
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Everything from
          <br />
          the <em className="italic text-leaf">market</em>, online
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/80">
          One platform for the staples, fresh produce and delivery you&apos;d
          normally piece together across town.
        </p>
      </div>

      <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((offer) => {
          const Icon = offer.icon;
          return (
            <div
              key={offer.title}
              className={`relative rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                offer.featured
                  ? "border-leaf bg-leaf shadow-lg shadow-leaf/30"
                  : "border-white/25 bg-white/10 hover:bg-white/15"
              }`}
            >
              {offer.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {offer.badge}
                </span>
              )}

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  offer.featured ? "bg-white/25" : "bg-white/15"
                }`}
              >
                <Icon size={22} strokeWidth={1.75} className="text-white" />
              </div>
              <h4 className="font-display text-base font-bold text-white">{offer.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">{offer.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}