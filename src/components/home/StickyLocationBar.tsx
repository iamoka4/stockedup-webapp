"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocationDropdown } from "@/components/LocationDropdown";
import { HOME_ROUTES } from "./routes";

// Picks up the hero's location pill at the exact moment it reaches the
// header, and holds it right under the (orange) header while you scroll.
// Tracks #hero-location; falls back to #home-hero, then to a scroll distance.
const SHOW_AFTER_PX = 400;

export function StickyLocationBar() {
  const [show, setShow] = useState(false);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    const pill = document.getElementById("hero-location");
    const hero = document.getElementById("home-hero");

    const update = () => {
      const headerBottom = header
        ? Math.max(0, header.getBoundingClientRect().bottom)
        : 0;
      setTop(headerBottom);
      if (pill) setShow(pill.getBoundingClientRect().top <= headerBottom + 8);
      else if (hero) setShow(hero.getBoundingClientRect().bottom <= headerBottom);
      else setShow(window.scrollY > SHOW_AFTER_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Re-measure when the header's height changes without a scroll/resize
    // (font load, hydration, mobile URL bar collapsing).
    let observer: ResizeObserver | undefined;
    if (header && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(header);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      style={{ top }}
      // The full-width strip never receives taps itself; only the pill below does.
      className={`pointer-events-none fixed inset-x-0 z-30 bg-brand pt-2 pb-2.5 shadow-md transition-[opacity,visibility] duration-150 ${
        show ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Same pill as the hero, same left edge */}
        <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-full bg-bg-raised p-2 text-ink shadow-lg shadow-black/15">
          <div className="min-w-0 flex-1 px-2">
            <LocationDropdown />
          </div>
          <Link
            href={HOME_ROUTES.shop}
            tabIndex={show ? 0 : -1}
            className="shrink-0 rounded-full bg-brand px-6 py-3 font-bold text-white transition hover:bg-brand-deep"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}