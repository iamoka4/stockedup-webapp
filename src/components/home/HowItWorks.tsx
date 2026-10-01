const STEPS = [
  {
    n: "01",
    title: "Choose what you need",
    text: "Browse food, groceries, supermarkets or local shops.",
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {["Food", "Groceries", "Stores", "Shops"].map((t) => (
            <span
              key={t}
              className="stamp justify-center px-3 py-1.5 text-[0.65rem] text-brand-deep"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-bg-raised px-3 py-2 text-sm">
          <span className="font-semibold">Chuk&apos;s Kitchen</span>
          <span className="tabular text-ink-soft">★ 4.8 · 15 min</span>
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "Place your order",
    text: "Add your items to cart, checkout and confirm your order.",
    visual: (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Jollof rice ×2</span>
          <span className="tabular">₦6,000</span>
        </div>
        <div className="flex justify-between">
          <span>Zobo ×1</span>
          <span className="tabular">₦800</span>
        </div>
        <div className="rounded-xl bg-brand py-2 text-center font-bold text-white">
          Confirm order
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "We deliver it",
    text: "KoulriaGo assigns a rider and delivers your order to your doorstep.",
    visual: (
      <div className="space-y-3 text-sm">
        <div className="font-semibold">Rider is on the way</div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-brand" />
        </div>
        <div className="text-ink-soft">Arriving in about 12 min</div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-tint py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          How StockedUp works
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex flex-col rounded-[1.75rem] border border-line bg-bg-raised p-7"
            >
              <span className="tabular text-5xl font-semibold text-brand">
                {s.n}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
              {/* flex-1 makes all three panels the same height; content stays centred */}
              <div className="mt-6 flex flex-1 flex-col justify-center rounded-2xl bg-bg p-4">
                {s.visual}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}