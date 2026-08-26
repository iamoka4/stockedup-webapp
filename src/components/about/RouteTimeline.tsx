"use client";

import { useEffect, useRef, useState } from "react";
import { Store, MapPin } from "lucide-react";

type Stop = { label: string; body: string };

const THREAD_SOLIDS = ["var(--brand)", "var(--leaf)", "var(--indigo)", "var(--clay)"];

export function RouteTimeline({ stops }: { stops: Stop[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [traced, setTraced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTraced(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative mt-16">
      <span
        className="absolute -top-4 left-4 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-sm sm:left-1/2"
        style={{ backgroundColor: "var(--brand)" }}
      >
        <Store size={16} strokeWidth={2} />
      </span>

      <div
        aria-hidden="true"
        className="absolute left-4 top-2 bottom-2 w-px bg-ink/10 sm:left-1/2 sm:-ml-px"
      />
      <div
        aria-hidden="true"
        className="absolute left-4 top-2 w-px origin-top bg-ink/40 transition-transform duration-[1400ms] ease-out motion-reduce:transition-none sm:left-1/2 sm:-ml-px"
        style={{ bottom: "0.5rem", transform: traced ? "scaleY(1)" : "scaleY(0)" }}
      />

      <span className="absolute -bottom-4 left-4 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-sm sm:left-1/2">
        <MapPin size={16} strokeWidth={2} />
      </span>

      <ol className="space-y-10 py-6">
        {stops.map((stop, i) => {
          const solid = THREAD_SOLIDS[i % THREAD_SOLIDS.length];
          return (
            <li
              key={stop.label}
              className={`relative pl-12 transition-all duration-700 ease-out motion-reduce:transition-none sm:w-1/2 sm:pl-0 sm:pr-10 ${
                traced ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              } ${
                i % 2 === 1
                  ? "sm:ml-auto sm:pl-10 sm:pr-0 sm:text-left"
                  : "sm:text-right"
              }`}
              style={{ transitionDelay: traced ? `${300 + i * 140}ms` : "0ms" }}
            >
              <span
                aria-hidden="true"
                className={`absolute top-1.5 h-2.5 w-2.5 rounded-full transition-transform duration-500 motion-reduce:transition-none ${
                  traced ? "scale-100" : "scale-0"
                } ${
                  i % 2 === 1
                    ? "left-4 -translate-x-1/2 sm:-left-6 sm:translate-x-0"
                    : "left-4 -translate-x-1/2 sm:-right-6 sm:left-auto sm:translate-x-0"
                }`}
                style={{ backgroundColor: solid, transitionDelay: `${200 + i * 140}ms` }}
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
                {stop.label}
              </p>
              <p className="mt-1 text-ink-soft">{stop.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}