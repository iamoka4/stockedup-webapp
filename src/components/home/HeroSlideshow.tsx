"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/home/hero-groceries.jpg", alt: "A basket of fresh groceries" },
  { src: "/home/hero-meals.jpg", alt: "Freshly cooked meals ready for delivery" },
  { src: "/home/hero-foodstuffs.jpg", alt: "Local foodstuffs from markets and shops" },
];

const INTERVAL_MS = 4500;

// Fills its parent: put it inside the element that currently holds the hero
// image (the one with the rounded corners and a set height).
export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Respect "reduce motion": stay on the first slide.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]); // resets the timer when someone taps a dot

  return (
    <div className="relative size-full overflow-hidden">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 45vw, 100vw"
          aria-hidden={i !== active}
          className={`object-cover transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}