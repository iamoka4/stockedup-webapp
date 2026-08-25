// app/referral/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Share2, UserPlus, Gift, Wallet, Percent } from "lucide-react";

export const metadata: Metadata = {
  title: "Refer & Earn",
};

const STEPS = [
  {
    num: 1,
    icon: Share2,
    title: "Share your code",
    body: "Send your referral code or link to a friend who hasn't tried StockedUp yet.",
  },
  {
    num: 2,
    icon: UserPlus,
    title: "They place an order",
    body: "Your friend signs up and completes their first order on the platform.",
  },
  {
    num: 3,
    icon: Gift,
    title: "You both get rewarded",
    body: "Your reward lands in your wallet — no extra steps, no waiting on paperwork.",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep">
      {children}
    </p>
  );
}

export default function ReferralPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Hero */}
      <section className="text-center">
        <SectionEyebrow>Refer & Earn</SectionEyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Share StockedUp, everybody wins
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-ink-soft">
          Invite a friend to StockedUp — you earn a reward, and they get a
          discount on their first order. It&apos;s free groceries and food
          shopping made easier, for both of you.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative overflow-hidden rounded-3xl border-2 border-brand-deep/10 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-deep/30 hover:shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-deep via-leaf to-brand-deep" />
                <span className="absolute right-4 top-6 font-display text-xs font-bold text-brand-deep/30">
                  {String(step.num).padStart(2, "0")}
                </span>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-deep to-brand-deep/70 text-white shadow-md shadow-brand-deep/30">
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h4 className="font-display text-lg font-bold text-ink">{step.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-sided reward */}
      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-brand-deep/20 bg-gradient-to-br from-brand-deep to-brand-deep/85 p-8 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Wallet size={20} strokeWidth={1.75} />
          </span>
          <p className="mt-4 font-display text-xl font-semibold">You earn</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Once your friend completes their first order, your reward is
            credited straight to your StockedUp wallet.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-leaf/30 bg-gradient-to-br from-leaf to-leaf/85 p-8 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Percent size={20} strokeWidth={1.75} />
          </span>
          <p className="mt-4 font-display text-xl font-semibold">They save</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Your friend gets a discount on their first order — a easy reason
            to finally give StockedUp a try.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl border border-brand-deep/15 bg-brand-deep/5 p-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Get the app to start referring
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Your referral code and wallet live inside the StockedUp app.
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.africa.stockedup"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          Download on Google Play
        </a>
      </section>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-ink-soft">
        Referral rewards are subject to our{" "}
        <Link href="/terms" className="font-medium text-brand-deep hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}