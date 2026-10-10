"use client";

// components/home/PromoBanner.tsx
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PromoSlide } from "@/lib/api/promo";

const AUTOPLAY_MS = 6000;
const RESUME_AFTER_TOUCH_MS = 4000;

// Admin-entered destinations -> web routes. The admin currently stores the
// mobile route strings, so those are mapped too. /vendors and /categories are
// confirmed; ⚠️ confirm /restaurants and /supermarkets.
const WEB_ROUTES: Record<string, string> = {
  restaurants: "/restaurants",
  supermarkets: "/supermarkets",
  categories: "/categories",
  vendors: "/vendors",
  "/(buyer)/(buyer-view)/restaurants-page": "/restaurants",
  "/(buyer)/(buyer-view)/supermarkets-page": "/supermarkets",
  "/(buyer)/(buyer-view)/category-page": "/categories",
  "/(buyer)/(tabs)/vendors-page": "/vendors",
};

type Resolved =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | null;

function resolveLink(link: string | null): Resolved {
  const value = link?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return { kind: "external", href: value };
  if (WEB_ROUTES[value]) return { kind: "internal", href: WEB_ROUTES[value] };
  // A plain web path is fine; an unmapped mobile route (contains "(") is not.
  if (value.startsWith("/") && !value.includes("(")) {
    return { kind: "internal", href: value };
  }
  return null;
}

export function PromoBanner({ slides }: { slides: PromoSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const count = slides.length;

  const goTo = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  // Keep the dots in sync with native swipe / scroll-snap.
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActive(index);
    }
  }, []);

  const pause = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setPaused(true);
  }, []);

  const resume = useCallback((delay = 0) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), delay);
  }, []);

  // Auto-rotate; skipped for a single slide, while paused, or for users who
  // prefer reduced motion.
  useEffect(() => {
    if (count < 2 || paused || dismissed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      goTo((activeRef.current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, dismissed, goTo]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    []
  );

  if (dismissed || count === 0) return null;

  const multiple = count > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotions"
      className="mx-auto w-full max-w-[960px]"
      onMouseEnter={pause}
      onMouseLeave={() => resume(0)}
      onFocus={pause}
      onBlur={() => resume(0)}
      onTouchStart={pause}
      onTouchEnd={() => resume(RESUME_AFTER_TOUCH_MS)}
      onTouchCancel={() => resume(RESUME_AFTER_TOUCH_MS)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-orange-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => {
            const target = resolveLink(slide.link);
            const image = (
              // Plain <img> so no next.config image-domain setup is needed.
              // Flyers are 1120 x 400 (2.8:1); the box keeps that ratio.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.imageUrl}
                alt={slide.title}
                width={1120}
                height={400}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full select-none object-cover"
              />
            );

            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                className="aspect-[2.8/1] w-full shrink-0 snap-center"
              >
                {target?.kind === "internal" ? (
                  <Link href={target.href} className="block h-full w-full">
                    {image}
                  </Link>
                ) : target?.kind === "external" ? (
                  <a
                    href={target.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    {image}
                  </a>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>

        {/* Kept from the previous banner. Delete this button to make it permanent. */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss promotions"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/50"
        >
          <X size={14} />
        </button>

        {multiple && (
          <>
            <button
              type="button"
              aria-label="Previous promotion"
              onClick={() => goTo((active - 1 + count) % count)}
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white md:flex"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next promotion"
              onClick={() => goTo((active + 1) % count)}
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white md:flex"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {multiple && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to promotion ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-brand" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}