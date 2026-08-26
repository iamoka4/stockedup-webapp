// app/about/page.tsx
import type { Metadata } from "next";
import {
  ShieldCheck,
  Zap,
  Heart,
  TrendingUp,
  Lightbulb,
  Package,
} from "lucide-react";
import { ScrollReveal } from "@/components/about/ScrollReveal";
import { RouteTimeline } from "@/components/about/RouteTimeline";

export const metadata: Metadata = {
  title: "About Us",
};

const VALUES = [
  { icon: ShieldCheck, title: "Trust", body: "We believe every transaction should be built on trust. From the vendors we onboard to the products customers receive, we are committed to creating a marketplace people can confidently use." },
  { icon: Zap, title: "Convenience", body: "Your time matters. We use technology to remove unnecessary stress from everyday food shopping and make ordering foodstuff as convenient as possible." },
  { icon: Heart, title: "Customer First", body: "Everything we build starts with the customer. We listen, improve and continuously look for better ways to make the shopping experience easier." },
  { icon: TrendingUp, title: "Empowerment", body: "Local vendors are at the heart of StockedUp. We want to give small and growing businesses access to technology, customers and opportunities that can help them grow." },
  { icon: Lightbulb, title: "Innovation", body: "We believe technology can solve everyday problems. We continuously improve our platform, processes and services to make food commerce better." },
  { icon: Package, title: "Reliability", body: "We don't just want to make ordering possible. We want customers and vendors to be able to depend on StockedUp to deliver a reliable experience." },
];

const STORY_STOPS = [
  { label: "The observation", body: "Customers still spend significant time moving between markets and stores to find the products they need, while many local foodstuff vendors depend heavily on physical foot traffic and word-of-mouth to reach customers." },
  { label: "The starting point", body: "We started in Awka, Nigeria, with the goal of solving a local problem first and building something that can eventually serve communities across Africa." },
  { label: "Where we are", body: "Since launching, StockedUp has continued to grow its network of local vendors, products and customers while learning from every order, every vendor and every customer interaction." },
  { label: "What's ahead", body: "We are building StockedUp one improvement at a time — with a long-term goal of making online foodstuff shopping and local food commerce more accessible across Africa." },
];

const THREAD = [
  { tint: "var(--brand-tint)", solid: "var(--brand)" },
  { tint: "var(--leaf-tint)", solid: "var(--leaf)" },
  { tint: "var(--indigo-tint)", solid: "var(--indigo)" },
  { tint: "var(--clay-tint)", solid: "var(--clay)" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
      {children}
    </p>
  );
}

function VendorThread({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
      {THREAD.map((t, i) => (
        <span key={i} className="h-1.5 w-9 rounded-full" style={{ backgroundColor: t.solid }} />
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      <style>{`
        @keyframes about-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-10 sm:pt-24">
          <div className="relative overflow-hidden rounded-3xl bg-bg-raised px-6 py-14 text-center sm:px-14 sm:py-20">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 opacity-20 sm:h-64 sm:w-64"
              style={{ color: "var(--brand)" }}
            >
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" strokeLinecap="round" />
            </svg>

            <div
              className="motion-reduce:!opacity-100 motion-reduce:animate-none"
              style={{ animation: "about-rise 0.7s ease-out both", animationDelay: "0ms" }}
            >
              <Eyebrow>Who We Are</Eyebrow>
            </div>
            <h1
              className="motion-reduce:!opacity-100 motion-reduce:animate-none mx-auto mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl"
              style={{ animation: "about-rise 0.7s ease-out both", animationDelay: "100ms" }}
            >
              A digital foodstuff marketplace,{" "}
              <span style={{ color: "var(--brand-deep, var(--brand))" }}>
                built for how Nigeria actually shops.
              </span>
            </h1>
            <p
              className="motion-reduce:!opacity-100 motion-reduce:animate-none mx-auto mt-6 max-w-2xl text-ink-soft sm:text-lg"
              style={{ animation: "about-rise 0.7s ease-out both", animationDelay: "200ms" }}
            >
              StockedUp Africa connects customers with trusted local food vendors across Nigeria, making it easier to buy foodstuff and everyday groceries online and have them delivered to your doorstep.
            </p>
            <p
              className="motion-reduce:!opacity-100 motion-reduce:animate-none mx-auto mt-4 max-w-2xl text-ink-soft"
              style={{ animation: "about-rise 0.7s ease-out both", animationDelay: "280ms" }}
            >
              From rice, beans, garri and grains to pasta, beverages, fish and other household essentials, StockedUp brings local food vendors and customers together on one easy-to-use platform — helping vendors take their businesses online, reach more customers and grow beyond their physical locations.
            </p>

            <div
              className="motion-reduce:!opacity-100 motion-reduce:animate-none mt-9 flex flex-col items-center gap-3"
              style={{ animation: "about-rise 0.7s ease-out both", animationDelay: "380ms" }}
            >
              <VendorThread />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
                Grains · Fish · Tubers · Produce — 21 categories, one marketplace
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-24">
        {/* Our Drive */}
        <section className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-5 sm:items-center">
          <div className="sm:col-span-2">
            <Eyebrow>Our Drive</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Closing the gap between vendors and customers
            </h2>
          </div>
          <div className="sm:col-span-3">
            <p className="text-ink-soft">
              Finding a trusted vendor, comparing products, visiting different markets, negotiating prices and arranging transportation can take valuable time. At the same time, many hardworking foodstuff vendors have great products but limited access to technology, online customers and digital tools.
            </p>
            <p className="mt-5 border-l-2 pl-4 font-display text-lg font-semibold text-ink" style={{ borderColor: "var(--brand)" }}>
              Our drive is to close this gap.
            </p>
            <p className="mt-4 text-ink-soft">
              We are driven by the opportunity to use technology to make everyday food shopping faster, easier, more convenient and more reliable.
            </p>
          </div>
        </section>

        {/* Mission + Vision */}
        <section className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-8" style={{ backgroundColor: THREAD[0].tint, borderColor: THREAD[0].solid }}>
            <span className="block h-1 w-10 rounded-full" style={{ backgroundColor: THREAD[0].solid }} />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">Our Mission</p>
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              To transform how people buy and sell foodstuff in Africa by connecting customers with trusted local vendors through technology.
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              We are building a marketplace that makes it simple for customers to discover, order and receive foodstuff, while giving local vendors the digital tools and visibility they need to grow.
            </p>
          </div>
          <div className="rounded-2xl border p-8" style={{ backgroundColor: THREAD[1].tint, borderColor: THREAD[1].solid }}>
            <span className="block h-1 w-10 rounded-full" style={{ backgroundColor: THREAD[1].solid }} />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">Our Vision</p>
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              To become Africa&apos;s most trusted digital marketplace for foodstuff and everyday essentials.
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              A future where buying foodstuff online is as simple and reliable as ordering any other product, while local vendors grow their businesses beyond the limits of their physical stores.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mt-24">
          <div className="text-center">
            <Eyebrow>Our Values</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">What guides how we build</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }, i) => {
              const c = THREAD[i % THREAD.length];
              return (
                <ScrollReveal key={title} delay={i * 90}>
                  <div className="rounded-2xl border p-6 transition-transform hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: c.tint, borderColor: c.solid }}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: c.solid }}>
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Our Promise */}
        <section className="mt-24 overflow-hidden rounded-2xl bg-ink text-center text-white">
          <VendorThread className="justify-center pt-8" />
          <div className="mx-auto max-w-2xl px-8 pb-14 pt-6">
            <Eyebrow>Our Promise</Eyebrow>
            <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
              We promise to keep making food shopping easier.
            </p>
            <p className="mt-5 text-white/70">
              To our customers, a marketplace you can trust. To our vendors, opportunities to reach more customers and grow. To everyone who uses StockedUp, we keep building with your needs at the centre of what we do.
            </p>
          </div>
        </section>

        {/* Our Story — the animated route */}
        <section className="mt-24">
          <div className="text-center">
            <Eyebrow>Our Story</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Buying foodstuff in Nigeria could be much easier
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
              Instead of customers visiting different vendors one by one, StockedUp brings those vendors into one digital marketplace — closer to how an order actually travels, from a vendor&apos;s stall to a customer&apos;s door.
            </p>
          </div>
          <RouteTimeline stops={STORY_STOPS} />
        </section>
      </div>
    </div>
  );
}