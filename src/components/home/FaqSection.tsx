// components/home/FaqSection.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "What is StockedUp?",
    a: "StockedUp is an indigenous digital platform that connects foodstuff vendors with individuals and families who want a faster, easier way to shop for groceries. Think of it as your local market — online, reliable, and delivered to your doorstep.",
  },
  {
    q: "Is the app available now?",
    a: "Yes! The StockedUp app is officially live and available for download on the Google Play Store. We are also preparing our official Apple App Store release for iOS users.",
  },
  {
    q: "Who can use StockedUp?",
    a: "Both buyers who want to skip market stress and shop conveniently, and vendors who want to take their foodstuff business online and reach more customers.",
  },
  {
    q: "Where will StockedUp be available?",
    a: "We're starting with Awka and its environs, and expanding to more cities soon after launch.",
  },
  {
    q: "How can I become a vendor?",
    a: "Reach out to us via our customer care or email us at hello@stockedup.africa. Our team will guide you through the onboarding process ahead of launch — it takes less than 5 minutes.",
  },
  {
    q: "What items will be sold on StockedUp?",
    a: "Everything you'd expect at the local market: rice, beans, grains, cooking oil, vegetables, fruits, meat, spices, canned foods, flour, and much more.",
  },
  {
    q: "How can I contact the team?",
    a: "Email us at support@stockedup.africa or reach out via our official social media pages. We respond to every message.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-deep">
            FAQ
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Got questions?<br /><em className="italic text-leaf">We&apos;ve got answers.</em>
          </h2>
          <p className="mt-3 text-ink-soft">Everything you need to know about StockedUp.</p>
          <a
            href="https://wa.me/2348104436235"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Contact Customer Care →
          </a>
        </div>

        <div className="flex flex-col">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink transition-colors hover:text-brand-deep"
                >
                  {item.q}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-deep/10 text-brand-deep transition-transform ${
                      isOpen ? "rotate-45 bg-brand-deep text-white" : ""
                    }`}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden text-sm leading-relaxed text-ink-soft transition-all duration-300 ${
                    isOpen ? "max-h-96 pb-4" : "max-h-0"
                  }`}
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}