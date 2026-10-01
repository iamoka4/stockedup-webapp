import Image from "next/image";
import Link from "next/link";
import { HOME_ROUTES } from "./routes";

const CARDS = [
  {
    title: "Food",
    text: "Order cooked meals from restaurants and food vendors around you.",
    href: HOME_ROUTES.food,
    img: "/home/card-food.jpg",
    tone: "bg-brand-deep",
  },
  {
    title: "Groceries",
    text: "Fresh produce, foodstuff and everyday essentials.",
    href: HOME_ROUTES.groceries,
    img: "/home/card-groceries.jpg",
    tone: "bg-leaf",
  },
  {
    title: "Supermarkets",
    text: "Shop from your favourite supermarkets and get your items delivered.",
    href: HOME_ROUTES.supermarkets,
    img: "/home/card-supermarkets.jpg",
    tone: "bg-indigo",
  },
  {
    title: "Local Shops",
    text: "Discover and shop from local businesses around you.",
    href: HOME_ROUTES.shops,
    img: "/home/card-shops.jpg",
    tone: "bg-clay",
  },
];

export function PlatformCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        One Platform.
        <br />
        Everything You Need.
      </h2>
      <p className="mt-4 max-w-xl text-lg text-ink-soft">
        From a hot plate of jollof to your weekly market run, shop from every kind of
        local merchants in one place.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className={`group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white transition duration-300 hover:-translate-y-1.5 lg:min-h-104 ${c.tone}`}
          >
            <Image
              src={c.img}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-70 transition duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
            />
            <div className="relative">
              <h3 className="font-display text-2xl font-bold">{c.title}</h3>
              <p className="mt-2 mb-5 text-sm text-white/90">{c.text}</p>
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-full bg-white text-lg font-bold text-ink transition group-hover:translate-x-1.5"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}