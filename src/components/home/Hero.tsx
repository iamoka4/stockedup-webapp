import Link from "next/link";
import { LocationDropdown } from "@/components/LocationDropdown";
import { HeroSlideshow } from "./HeroSlideshow";
import { HOME_ROUTES } from "./routes";

export function Hero() {
  return (
    <section id="home-hero" className="relative bg-brand text-white">
      <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-6 pt-14 md:grid-cols-[1.1fr_.9fr] md:pt-24">
        <div className="pb-12 md:pb-24">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Everything you need, delivered.
          </h1>
          <p className="mt-6 mb-8 max-w-lg text-lg text-white/95 sm:text-xl">
            Order cooked meals, groceries, supermarket essentials and more from
            businesses around you.
          </p>

          <div id="hero-location" className="flex max-w-xl flex-col gap-2 rounded-3xl bg-bg-raised p-2 text-ink shadow-2xl shadow-black/25 sm:flex-row sm:items-center sm:rounded-full">
            <div className="min-w-0 flex-1 px-2">
              <LocationDropdown />
            </div>
            <Link
              href={HOME_ROUTES.shop}
              className="rounded-full bg-brand px-6 py-3 text-center font-bold text-white transition hover:bg-brand-deep"
            >
              Start Shopping
            </Link>
          </div>


          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <li className="stamp">Local vendors</li>
            <li className="stamp">Verified riders</li>
            <li className="stamp">Doorstep delivery</li>
          </ul>
        </div>

        {/* Rotating hero photos: groceries, cooked meals, foodstuffs.
            Edit the slides in HeroSlideshow.tsx. */}
        <div className="relative h-80 overflow-hidden rounded-t-[2.5rem] bg-brand-deep md:h-120">
          <HeroSlideshow />
        </div>
      </div>

      {/* Wave edge into the white page */}
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-10 h-8 w-full fill-bg md:h-16"
      >
        <path d="M0 40C240 90 480 0 720 30c240 30 480 60 720-10V80H0Z" />
      </svg>
    </section>
  );
}