import type { Metadata } from "next";
import { MerchantOS, MerchantSteps, PLAY_STORE_URL } from "@/components/home/MerchantOS";
import { MerchantGrowth } from "@/components/home/MerchantGrowth";

// Not linked from the landing page: reached from the footer's
// "Become a Merchant". To keep it out of search results as well, add
//   robots: { index: false, follow: false },
// to the metadata below.
export const metadata: Metadata = {
  title: "Sell on StockedUp",
  description:
    "Sell online, manage your operations and grow your business with StockedUp's merchant tools.",
};

export default function MerchantsPage() {
  return (
    <>
      <MerchantOS asPageTitle showSteps={false} />
      <MerchantGrowth />
      <MerchantSteps />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-4xl bg-brand px-6 py-14 text-center text-white md:py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Ready to grow your business?
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-lg text-lg text-white/95">
            Download the Stockedup app now&apos;lets get you started right away.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-brand-deep transition hover:bg-brand-tint"
          >
            Get the app now
          </a>
        </div>
      </section>
    </>
  );
}