import Link from "next/link";
import { HOME_ROUTES } from "./routes";

const TOOLS = [
  ["⭐", "Featured stores", "Top placement where shoppers look first."],
  ["📣", "Sponsored products", "Put your best sellers in front of buyers."],
  ["🏷️", "Promotions & discounts", "Offers that bring people in."],
  ["🎯", "Customer acquisition", "Reach new buyers near you."],
  ["🤝", "Referral campaigns", "Let happy customers bring their friends."],
  ["🔲", "QR marketing", "Turn foot traffic into online orders."],
] as const;

export function MerchantGrowth() {
  return (
    <section id="growth" className="relative overflow-hidden bg-leaf py-20 text-white md:py-28">
      <div aria-hidden className="absolute -top-32 -right-32 size-96 rounded-full bg-brand/20" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            More customers. More visibility. More growth.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Use StockedUp&apos;s growth tools to get your business in front of
            more people and turn them into regulars.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {TOOLS.map(([icon, title, text]) => (
              <li
                key={title}
                className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <b className="block">{title}</b>
                  <span className="text-sm text-white/75">{text}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href={`${HOME_ROUTES.merchants}#how-to-register`}
            className="mt-8 inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
          >
            Grow Your Business
          </Link>
        </div>

        <div aria-hidden className="rounded-4xl bg-bg-raised p-6 text-ink shadow-2xl">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            Growth analytics
            <span className="stamp">Sample data</span>
          </div>
          <div className="mt-3 flex gap-8">
            <div>
              <b className="tabular font-display text-4xl">+38%</b>
              <div className="text-sm text-ink-soft">new customers</div>
            </div>
            <div>
              <b className="tabular font-display text-4xl">2.4×</b>
              <div className="text-sm text-ink-soft">store views</div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-brand bg-brand-tint p-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-xl">🍗</span>
            <div>
              <span className="stamp text-brand-deep">Sponsored</span>
              <div className="mt-1 font-bold">Your store · Featured</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-line p-3">
            <div className="size-16 rounded-md border-4 border-white bg-[conic-gradient(var(--ink)_25%,#fff_0_50%,var(--ink)_0_75%,#fff_0)] bg-size-[16px_16px] outline-2 outline-ink" />
            <div>
              <b>Scan to order</b>
              <div className="text-sm text-ink-soft">Counter QR code</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}