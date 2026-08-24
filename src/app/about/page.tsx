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

export const metadata: Metadata = {
  title: "About Us",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    body: "We believe every transaction should be built on trust. From the vendors we onboard to the products customers receive, we are committed to creating a marketplace people can confidently use.",
  },
  {
    icon: Zap,
    title: "Convenience",
    body: "Your time matters. We use technology to remove unnecessary stress from everyday food shopping and make ordering foodstuff as convenient as possible.",
  },
  {
    icon: Heart,
    title: "Customer First",
    body: "Everything we build starts with the customer. We listen, improve and continuously look for better ways to make the shopping experience easier.",
  },
  {
    icon: TrendingUp,
    title: "Empowerment",
    body: "Local vendors are at the heart of StockedUp. We want to give small and growing businesses access to technology, customers and opportunities that can help them grow.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "We believe technology can solve everyday problems. We continuously improve our platform, processes and services to make food commerce better.",
  },
  {
    icon: Package,
    title: "Reliability",
    body: "We don't just want to make ordering possible. We want customers and vendors to be able to depend on StockedUp to deliver a reliable experience.",
  },
];

const STORY_STOPS = [
  {
    label: "The observation",
    body: "Customers still spend significant time moving between markets and stores to find the products they need, while many local foodstuff vendors depend heavily on physical foot traffic and word-of-mouth to reach customers.",
  },
  {
    label: "The starting point",
    body: "We started in Awka, Nigeria, with the goal of solving a local problem first and building something that can eventually serve communities across Africa.",
  },
  {
    label: "Where we are",
    body: "Since launching, StockedUp has continued to grow its network of local vendors, products and customers while learning from every order, every vendor and every customer interaction.",
  },
  {
    label: "What's ahead",
    body: "We are building StockedUp one improvement at a time — with a long-term goal of making online foodstuff shopping and local food commerce more accessible across Africa.",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Who We Are */}
      <section className="text-center">
        <SectionEyebrow>Who We Are</SectionEyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          A digital foodstuff marketplace, built for how Nigeria actually shops
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-ink-soft">
          StockedUp Africa connects customers with trusted local food vendors across
          Nigeria, making it easier to buy foodstuff and everyday groceries online
          and have them delivered to your doorstep.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-ink-soft">
          From rice, beans, garri and grains to pasta, beverages, fish and other
          household essentials, StockedUp brings local food vendors and customers
          together on one easy-to-use platform — helping vendors take their
          businesses online, reach more customers and grow beyond their physical
          locations.
        </p>
      </section>

      {/* Our Drive */}
      <section className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-5 sm:items-center">
        <div className="sm:col-span-2">
          <SectionEyebrow>Our Drive</SectionEyebrow>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Closing the gap between vendors and customers
          </h2>
        </div>
        <div className="sm:col-span-3">
          <p className="text-ink-soft">
            Finding a trusted vendor, comparing products, visiting different
            markets, negotiating prices and arranging transportation can take
            valuable time. At the same time, many hardworking foodstuff vendors
            have great products but limited access to technology, online
            customers and digital tools.
          </p>
          <p className="mt-4 font-semibold text-ink">
            Our drive is to close this gap.
          </p>
          <p className="mt-4 text-ink-soft">
            We are driven by the opportunity to use technology to make everyday
            food shopping faster, easier, more convenient and more reliable.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8">
          <SectionEyebrow>Our Mission</SectionEyebrow>
          <p className="mt-4 text-ink">
            To transform how people buy and sell foodstuff in Africa by
            connecting customers with trusted local vendors through technology.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            We are building a marketplace that makes it simple for customers to
            discover, order and receive foodstuff, while giving local vendors
            the digital tools and visibility they need to grow.
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8">
          <SectionEyebrow>Our Vision</SectionEyebrow>
          <p className="mt-4 text-ink">
            To become Africa&apos;s most trusted digital marketplace for
            foodstuff and everyday essentials.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            A future where buying foodstuff online is as simple and reliable as
            ordering any other product, while local vendors grow their
            businesses beyond the limits of their physical stores.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="mt-20">
        <div className="text-center">
          <SectionEyebrow>Our Values</SectionEyebrow>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
            What guides how we build
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-ink/10 p-6 transition-colors hover:border-brand-deep/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-deep/10 text-brand-deep">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Promise */}
      <section className="mt-20 rounded-2xl bg-ink text-center text-white">
        <div className="mx-auto max-w-2xl px-8 py-14">
          <SectionEyebrow>Our Promise</SectionEyebrow>
          <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
            We promise to keep making food shopping easier.
          </p>
          <p className="mt-5 text-white/70">
            To our customers, a marketplace you can trust. To our vendors,
            opportunities to reach more customers and grow. To everyone who uses
            StockedUp, we keep building with your needs at the centre of what we
            do.
          </p>
        </div>
      </section>

      {/* Our Story — delivery-route thread */}
      <section className="mt-20">
        <div className="text-center">
          <SectionEyebrow>Our Story</SectionEyebrow>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Buying foodstuff in Nigeria could be much easier
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
            Instead of customers visiting different vendors one by one,
            StockedUp brings those vendors into one digital marketplace —
            closer to how an order actually travels, from a vendor&apos;s stall
            to a customer&apos;s door.
          </p>
        </div>

        <div className="relative mt-14">
          {/* the route line */}
          <div
            aria-hidden
            className="absolute left-4 top-2 bottom-2 w-px bg-ink/10 sm:left-1/2 sm:-ml-px"
          />
          <ol className="space-y-10">
            {STORY_STOPS.map((stop, i) => (
              <li
                key={stop.label}
                className={`relative pl-12 sm:w-1/2 sm:pl-0 sm:pr-10 ${
                  i % 2 === 1
                    ? "sm:ml-auto sm:pl-10 sm:pr-0 sm:text-left"
                    : "sm:text-right"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-1.5 h-2.5 w-2.5 rounded-full bg-brand-deep ${
                    i % 2 === 1
                      ? "left-4 -translate-x-1/2 sm:-left-[1.5rem] sm:translate-x-0"
                      : "left-4 -translate-x-1/2 sm:-right-[1.5rem] sm:left-auto sm:translate-x-0"
                  }`}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
                  {stop.label}
                </p>
                <p className="mt-1 text-ink-soft">{stop.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mx-auto mt-14 max-w-2xl text-center font-display text-lg font-semibold text-ink">
          StockedUp is more than a marketplace. We are building the digital
          infrastructure that connects local food businesses to the customers
          who need them.
        </p>
      </section>
    </div>
  );
}