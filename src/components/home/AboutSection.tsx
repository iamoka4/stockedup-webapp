// components/home/AboutSection.tsx
const ABOUT_CARDS = [
  { icon: "⚡", title: "Built for speed", body: "From browsing to doorstep — the fastest grocery experience in your city.", accent: true },
  { icon: "🤝", title: "Vetted vendors", body: "Every vendor on our platform is screened for quality and reliability." },
  { icon: "📍", title: "Local first", body: "We support local market sellers while making their produce accessible to everyone." },
  { icon: "🎁", title: "Loyalty rewards", body: "Earn points on every order and refer friends for extra bonuses." },
];

export function AboutSection() {
  return (
    <section className="py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-deep">
            Who we are
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Bridging buyers<br />and <em className="italic text-leaf">trusted vendors</em>
          </h2>
          <p className="mt-4 text-ink-soft">
            StockedUp removes the friction between you and your weekly groceries. We connect you to
            vetted local vendors — no haggling, no market stress, no wasted time.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ABOUT_CARDS.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${
                  card.accent
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-bg-raised"
                }`}
              >
                <div className="mb-3 text-2xl">{card.icon}</div>
                <h4 className={`font-display text-base font-bold ${card.accent ? "text-white" : "text-ink"}`}>
                  {card.title}
                </h4>
                <p className={`mt-1 text-sm leading-relaxed ${card.accent ? "text-white/65" : "text-ink-soft"}`}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <img
          src="/images/slide4.jpeg"
          alt="StockedUp freshness"
          className="w-full rounded-3xl shadow-xl"
        />
      </div>
    </section>
  );
}