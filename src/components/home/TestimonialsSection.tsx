// components/home/TestimonialsSection.tsx
const TESTIMONIALS = [
  {
    text: "This service completely transformed how we do shopping. The attention to detail and professional approach exceeded all our expectations.",
    stars: 5,
    name: "Sarah Elota",
    role: "Early user · Awka",
    initials: "SE",
    avatarClass: "bg-leaf",
  },
  {
    text: "I've never experienced such dedication and quality. The team went above and beyond to deliver exactly what we needed. Highly recommended!",
    stars: 5,
    name: "Enu Micheal",
    role: "Vendor partner",
    initials: "EM",
    featured: true,
  },
  {
    text: "Exceptional results that speak for themselves. Professional, reliable, and incredibly talented. This is the partnership we've been looking for.",
    stars: 5,
    name: "David Chukwuemeka",
    role: "Early user · Awka",
    initials: "DC",
    avatarClass: "bg-brand-deep",
  },
  {
    text: "As a trader in Eke-Awka market, I was sceptical at first. But the StockedUp team came personally to verify my stand and explained the whole thing. Now I'm reaching customers in Amawbia and Nnewi that I've never sold to before.",
    stars: 5,
    name: "Emeka Obi",
    role: "Grains Vendor, Eke-Awka",
    initials: "EO",
    avatarClass: "bg-leaf",
  },
  {
    text: "I'm a mum of three in Okpuno and the market is far from us. StockedUp beta has been a lifesaver — I ordered ugu leaves, crayfish, and garri last week and it came within hours.",
    stars: 5,
    name: "Chioma Nwosu",
    role: "Stay-at-home mum, Okpuno",
    initials: "CN",
    featured: true,
  },
  {
    text: "I live near UNIZIK and I order for my hostel almost every week now. The prices are fair — same as market price — and the delivery guys are always polite.",
    stars: 4,
    name: "Chukwuebuka Ani",
    role: "Student, UNIZIK Awka",
    initials: "CA",
    avatarClass: "bg-brand-deep",
  },
  {
    text: "I sell fresh tomatoes and pepper around Aroma junction. StockedUp gave me a dashboard to list my stock and manage orders — something I never thought I'd have.",
    stars: 5,
    name: "Ngozi Eze",
    role: "Produce Vendor, Aroma Junction",
    initials: "NE",
    avatarClass: "bg-leaf",
  },
  {
    text: "My farm is in Nibo but most of my customers are in Awka proper. StockedUp handles delivery for me — I just harvest, list, and pack. The coordination is smooth.",
    stars: 5,
    name: "Ikenna Ezeh",
    role: "Farm Owner, Nibo",
    initials: "IE",
    featured: true,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16">
      <div className="mb-12 text-center">
        <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand-deep">
          Early voices
        </span>
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          What early users<br /><em className="italic text-leaf">are saying</em>
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-6 transition-transform hover:-translate-y-1 ${
              t.featured
                ? "border-brand-deep bg-brand-deep"
                : "border-line bg-white"
            }`}
          >
            <div className={`mb-3 text-sm tracking-wide ${t.featured ? "text-white/90" : "text-brand-warm"}`}>
              {"★".repeat(t.stars)}
              {"☆".repeat(5 - t.stars)}
            </div>
            <p className={`mb-5 text-sm italic leading-relaxed ${t.featured ? "text-white/80" : "text-ink-soft"}`}>
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  t.featured ? "bg-white/25" : t.avatarClass
                }`}
              >
                {t.initials}
              </div>
              <div>
                <div className={`text-sm font-medium ${t.featured ? "text-white" : "text-ink"}`}>
                  {t.name}
                </div>
                <div className={`text-xs ${t.featured ? "text-white/60" : "text-ink-soft"}`}>
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}