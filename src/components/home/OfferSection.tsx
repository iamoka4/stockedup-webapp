// components/home/OfferSection.tsx
const OFFERS = [
  { icon: "🛍️", title: "Groceries & Foodstuffs", body: "Rice, beans, cooking oil, spices and every staple you need — sourced fresh from local vendors." },
  { icon: "🚚", title: "Doorstep Delivery", body: "Track your order in real time. Our logistics partners bring it straight to you.", featured: true },
  { icon: "🥦", title: "Fresh Vegetables", body: "Tomatoes, ugu, garden eggs, peppers — straight from the farm, not from storage." },
  { icon: "🥫", title: "Canned Foods", body: "Your favourite packaged and canned essentials, stocked and ready to order." },
  { icon: "🌾", title: "Flour & Grains", body: "Semolina, wheat flour, garri, millet — bulk or small portions, always available." },
  { icon: "📊", title: "Customer Dashboard", body: "Manage orders, track deliveries, view history and redeem loyalty points in one place." },
];

export function OfferSection() {
  return (
    <section className="rounded-3xl bg-ink px-6 py-16 sm:px-10">
      <div className="mb-10 text-center">
        <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-warm">
          What we offer
        </span>
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Everything from<br />the <em className="italic text-brand-warm">market</em>, online
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((offer) => (
          <div
            key={offer.title}
            className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
              offer.featured
                ? "border-brand-deep bg-brand-deep"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                offer.featured ? "bg-white/25" : "bg-white/10"
              }`}
            >
              {offer.icon}
            </div>
            <h4 className="font-display text-base font-bold text-white">{offer.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">{offer.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}