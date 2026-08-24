// components/home/HowItWorksSection.tsx
const STEPS = [
  { num: 1, title: "Browse", body: "Explore a curated selection of fresh food and groceries from trusted vendors near you." },
  { num: 2, title: "Order", body: "Add items to your cart, choose delivery time, and pay securely through multiple options." },
  { num: 3, title: "Track", body: "Follow your order in real time — from the vendor's hands to your doorstep." },
  { num: 4, title: "Delivered", body: "Receive your groceries fresh, on time, right where you are. Easy." },
];

export function HowItWorksSection() {
  return (
    <section className="py-16">
      <div className="mb-12 text-center">
        <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-deep">
          How it works
        </span>
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Four steps to<br /><em className="italic text-leaf">fresh groceries</em>
        </h2>
      </div>

      <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden border-t-2 border-dashed border-brand-deep/30 lg:block" />
        {STEPS.map((step) => (
          <div key={step.num} className="group relative text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-deep/25 bg-bg font-display text-xl font-black text-brand-deep transition-colors group-hover:border-brand-deep group-hover:bg-brand-deep group-hover:text-white">
              {step.num}
            </div>
            <h4 className="font-display text-lg font-bold text-ink">{step.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}