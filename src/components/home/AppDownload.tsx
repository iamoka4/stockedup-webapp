import Image from "next/image";

// Real buyer-app screenshots, shown exactly as captured (no UI changes).
// Add the five image files to public/home/app/ (portrait phone screenshots,
// cropped to just the phone screen, roughly 1080x2400):
//   meals.png       Cooked meals (products grid)
//   home.png        Home: categories + vendors
//   restaurants.png Restaurants list
//   featured.png    Featured products
//   orders.png      My Orders
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.africa.stockedup";

const SHOT = {
  meals: { src: "/home/app/meals.png", alt: "StockedUp app cooked meals: okra, jollof rice, oha soup and more" },
  home: { src: "/home/app/home.png", alt: "StockedUp app home screen with categories and vendors" },
  restaurants: { src: "/home/app/restaurants.png", alt: "StockedUp app restaurants list" },
  featured: { src: "/home/app/featured.png", alt: "StockedUp app featured products" },
  orders: { src: "/home/app/orders.png", alt: "StockedUp app order details" },
} as const;

// Glovo-style: a tilted grid of phones laid back in perspective, side by
// side with even gaps (no overlapping), each column stepped down a little so
// the grid reads as a diagonal, and the whole cluster clipped by the section.
const COLUMNS = [
  { offset: "mt-0", shots: [SHOT.meals, SHOT.home] },
  { offset: "mt-10 sm:mt-14", shots: [SHOT.restaurants, SHOT.featured] },
  { offset: "mt-20 sm:mt-28", shots: [SHOT.orders] },
];

export function AppDownload() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="text-center lg:text-left">
          <span
            aria-hidden
            className="mx-auto grid size-20 place-items-center rounded-full bg-brand-tint text-4xl lg:mx-0"
          >
            📱
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Download the app
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-lg text-ink-soft lg:mx-0">
            Order cooked meals, groceries and more, and track it in real time
            with the StockedUp app.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-14 w-auto"
              />
            </a>

            {/* App Store: not live yet, so this is a non-clickable "coming soon" badge. */}
            <div
              role="img"
              aria-label="App Store version coming soon"
              className="flex h-14 min-w-40 cursor-default flex-col justify-center rounded-lg border border-white/30 bg-ink px-4 text-white opacity-70"
            >
              <span className="text-[10px] leading-tight tracking-wide uppercase">
                Coming soon on the
              </span>
              <span className="text-lg leading-tight font-semibold">App Store</span>
            </div>
          </div>
        </div>

        {/* Clipped stage: the tilted grid bleeds off the edges on purpose. */}
        <div className="relative h-104 overflow-hidden sm:h-144">
          <div className="absolute top-0 left-1/2 flex gap-3 [transform:translateX(-50%)_perspective(1400px)_rotateX(22deg)_rotateZ(-26deg)] sm:gap-5">
            {COLUMNS.map((col, i) => (
              <div key={i} className={`flex flex-col gap-3 sm:gap-5 ${col.offset}`}>
                {col.shots.map((s) => (
                  <div
                    key={s.src}
                    className="w-28 overflow-hidden rounded-3xl border-4 border-ink bg-ink shadow-2xl shadow-brand-deep/25 sm:w-36 lg:w-40"
                  >
                    <Image
                      src={s.src}
                      alt={s.alt}
                      width={540}
                      height={1200}
                      sizes="(min-width: 1024px) 160px, (min-width: 640px) 144px, 112px"
                      className="h-auto w-full"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}