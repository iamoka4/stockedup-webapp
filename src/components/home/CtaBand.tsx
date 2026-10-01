import Link from "next/link";
import { HOME_ROUTES } from "./routes";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8">
      <div className="relative overflow-hidden rounded-4xl bg-brand px-6 py-16 text-center text-white md:py-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12] [background:repeating-conic-gradient(from_45deg_at_50%_50%,#000_0_25%,transparent_0_50%)_0_0/48px_48px]"
        />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Ready to shop smarter?
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-lg text-lg text-white/95">
            Discover food, groceries, supermarkets and local businesses around you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={HOME_ROUTES.shop}
              className="rounded-full bg-white px-7 py-3.5 font-bold text-brand-deep transition hover:bg-brand-tint"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}