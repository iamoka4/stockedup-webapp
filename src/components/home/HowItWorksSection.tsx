// components/home/HowItWorksSection.tsx
import { Search, ShoppingCart, Truck, PackageCheck, ChevronRight } from "lucide-react";

const STEPS = [
  {
    num: 1,
    icon: Search,
    title: "Browse",
    body: "Explore a curated selection of fresh food and groceries from trusted vendors near you.",
  },
  {
    num: 2,
    icon: ShoppingCart,
    title: "Order",
    body: "Add items to your cart, choose delivery time, and pay securely through multiple options.",
  },
  {
    num: 3,
    icon: Truck,
    title: "Track",
    body: "Follow your order in real time — from the vendor's hands to your doorstep.",
  },
  {
    num: 4,
    icon: PackageCheck,
    title: "Delivered",
    body: "Receive your groceries fresh, on time, right where you are. Easy.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-deep/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-leaf/10 blur-3xl"
      />

      <div className="mb-14 text-center">
        <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-deep">
          How it works
        </span>
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Four steps to
          <br />
          <em className="italic text-leaf">fresh groceries</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
          From your first tap to the bag on your doorstep — no market trip, no
          guesswork.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch lg:gap-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="flex items-stretch gap-4">
              <div className="group relative flex-1 overflow-hidden rounded-3xl border-2 border-brand-deep/15 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-deep/40 hover:shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-deep via-leaf to-brand-deep" />

                <span className="absolute right-4 top-6 font-display text-xs font-bold text-brand-deep/30">
                  {String(step.num).padStart(2, "0")}
                </span>

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-deep to-brand-deep/70 text-white shadow-md shadow-brand-deep/30 transition-transform duration-200 group-hover:scale-105">
                  <Icon size={24} strokeWidth={1.75} />
                </div>

                <h4 className="font-display text-lg font-bold text-ink">{step.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden items-center lg:flex">
                  <ChevronRight size={20} className="text-brand-deep" strokeWidth={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}