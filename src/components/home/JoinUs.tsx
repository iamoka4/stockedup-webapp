import Image from "next/image";
import Link from "next/link";
import { HOME_ROUTES } from "./routes";

// Photos go in public/home/: join-rider.jpg, join-business.jpg, join-careers.jpg
// (square-ish crops of real people: a KoulriaGo rider, a Nigerian chef or
// shopkeeper, and the team).
const CARDS = [
  {
    title: "Become a rider",
    text: "Earn on your own schedule by delivering StockedUp orders with KoulriaGo.",
    cta: "Learn more",
    href: HOME_ROUTES.riderSignup,
    img: "/home/join-rider.jpg",
    alt: "A KoulriaGo rider with an orange delivery bag",
    back: "bg-indigo",
    blob: "rounded-[58%_42%_55%_45%/52%_48%_52%_48%]",
  },
  {
    title: "Register your business",
    text: "Sell to more customers and run your store from one dashboard with StockedUp's merchant tools.",
    cta: "Register here",
    href: HOME_ROUTES.merchants,
    img: "/home/join-business.jpg",
    alt: "A Nigerian chef preparing food in a restaurant kitchen",
    back: "bg-brand",
    blob: "rounded-[45%_55%_42%_58%/55%_45%_58%_42%]",
  },
  {
    title: "Careers",
    text: "Want to help build local commerce in Africa? We'd love to hear from you.",
    cta: "Get in touch",
    href: HOME_ROUTES.careers,
    img: "/home/join-careers.jpg",
    alt: "The StockedUp team working together",
    back: "bg-leaf",
    blob: "rounded-[52%_48%_60%_40%/46%_56%_44%_54%]",
  },
];

export function JoinUs() {
  return (
    <section className="bg-linear-to-b from-brand-tint to-bg py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Let&apos;s do it together
        </h2>

        <ul className="mt-14 grid gap-14 md:grid-cols-3 md:gap-8">
          {CARDS.map((c) => (
            <li key={c.title} className="flex flex-col items-center text-center">
              {/* Offset colour blob behind a blob-shaped photo */}
              <div className="relative size-48 sm:size-52">
                <div
                  aria-hidden
                  className={`absolute inset-0 -translate-x-3 -translate-y-3 ${c.back} ${c.blob}`}
                />
                <div className={`relative size-full overflow-hidden bg-line ${c.blob}`}>
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="208px"
                    className="object-cover"
                  />
                </div>
              </div>

              <h3 className="mt-8 font-display text-2xl font-bold">{c.title}</h3>
              <p className="mt-3 max-w-xs text-ink-soft">{c.text}</p>
              <Link
                href={c.href}
                className="mt-6 rounded-full bg-brand px-7 py-3 font-bold text-white transition hover:bg-brand-deep"
              >
                {c.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}