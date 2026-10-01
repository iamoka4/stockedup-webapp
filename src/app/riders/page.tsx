import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become a Rider",
  description:
    "Ride with KoulriaGo and earn on your own schedule delivering StockedUp orders. Contact support to get started.",
};

// TODO: if support has a dedicated email/WhatsApp for rider enquiries, link it here.
const CONTACT_HREF = "/contact";

const BLOB = "rounded-[58%_42%_55%_45%/52%_48%_52%_48%]";

const ABOUT = [
  ["Verified riders", "Every rider is vetted before joining, so customers and vendors know who is at the door."],
  ["Automatic rider assignment", "Orders reach you through the app, assigned automatically."],
  ["Real-time location tracking", "Customers can follow their order live while you ride."],
  ["Order status updates", "Update each stage in the app so customers and vendors stay informed."],
  ["Doorstep delivery", "You bring every order right to the customer's door."],
  ["Your own schedule", "Earn on your own schedule by delivering StockedUp orders."],
] as const;

const STEPS = [
  ["01", "Contact support", "Tell our team you'd like to ride with KoulriaGo. We'll guide you through what we need from you."],
  ["02", "Get verified", "We check your details before approving you. Every KoulriaGo rider is vetted."],
  ["03", "Receive the rider app", "Approved riders are sent the KoulriaGo rider app directly. It isn't on the Play Store or App Store."],
  ["04", "Start delivering", "Go online, get orders assigned to you automatically, and deliver to customers' doorsteps."],
] as const;

const STAGES = [
  ["Order confirmed", "A customer places an order and the vendor confirms it."],
  ["Rider assigned", "The order is assigned to a rider automatically."],
  ["Picked up", "Collect the order from the vendor and mark it picked up in the app."],
  ["Delivered", "Bring it to the customer's doorstep and complete the delivery."],
] as const;

const REQUIREMENTS = [
  "Must be 18 years or older",
  "Have a valid ID",
  "Have a smartphone and a vehicle",
  "Be dedicated",
] as const;

const FAQ = [
  [
    "Can I download the rider app from the Play Store?",
    "Not yet. The KoulriaGo rider app isn't available for public download. It's shared directly with riders who have been vetted by our team.",
  ],
  [
    "How do I get the rider app?",
    "Contact support and tell us you'd like to become a rider. If you're approved, we'll send you the app and help you get set up.",
  ],
  [
    "Where does KoulriaGo deliver?",
    "We're operating in Awka, Anambra State, and will grow to more areas over time.",
  ],
  [
    "How and when do riders get paid?",
    "Our support team will walk you through how earnings and payments work when you get in touch.",
  ],
  [
    "Do I have to ride set hours?",
    "KoulriaGo is built around flexibility. You earn on your own schedule.",
  ],
] as const;

export default function RidersPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <span className="stamp text-brand-deep">Vetted riders only</span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ride with KoulriaGo.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Earn on your own schedule delivering StockedUp orders. KoulriaGo
              is our dedicated rider network, and every rider is vetted before
              joining.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={CONTACT_HREF}
                className="inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
              >
                Contact support to get started
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex rounded-full border border-line bg-bg-raised px-7 py-3.5 font-bold text-ink transition hover:border-brand"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="relative mx-auto size-64 sm:size-80">
            <div
              aria-hidden
              className={`absolute inset-0 -translate-x-4 -translate-y-4 bg-brand ${BLOB}`}
            />
            <div className={`relative size-full overflow-hidden bg-line ${BLOB}`}>
              <Image
                src="/home/join-rider.jpg"
                alt="A KoulriaGo rider with an orange delivery bag"
                fill
                priority
                sizes="(min-width: 640px) 320px, 256px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About KoulriaGo */}
      <section id="about-koulriago" className="scroll-mt-28 bg-brand py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Meet KoulriaGo.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/95">
              KoulriaGo is the rider network behind every StockedUp delivery.
              Riders get orders, pick them up from local vendors and bring them
              to customers, with everyone kept up to date along the way.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {ABOUT.map(([title, text]) => (
                <li
                  key={title}
                  className="rounded-2xl border border-white/25 bg-white/10 p-4"
                >
                  <b className="block">{title}</b>
                  <span className="text-sm text-white/90">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-96 overflow-hidden rounded-4xl bg-white/10 md:h-112">
            <Image
              src="/home/koulriago-rider.jpg"
              alt="A KoulriaGo rider on a delivery in Awka"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* How to join */}
      <section id="how-it-works" className="scroll-mt-28 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How to become a rider
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
            The KoulriaGo rider app is not out for public download. It&apos;s
            only for vetted riders, and it all starts with support.
          </p>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, title, text]) => (
              <li
                key={n}
                className="rounded-[1.75rem] border border-line bg-bg-raised p-7"
              >
                <span className="tabular text-5xl font-semibold text-brand">{n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* A delivery from the rider's side */}
      <section className="bg-brand-tint py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What a delivery looks like
          </h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-4">
            {STAGES.map(([title, text], i) => (
              <li key={title} className="rounded-3xl bg-bg-raised p-6">
                <div className="mb-4 flex items-center gap-2">
                  {STAGES.map((_, j) => (
                    <i
                      key={j}
                      className={`h-1.5 flex-1 rounded-full ${j <= i ? "bg-brand" : "bg-line"}`}
                    />
                  ))}
                </div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Requirements to become a rider
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
            Make sure you meet these before you contact support.
          </p>
          <ul className="mt-10 space-y-3">
            {REQUIREMENTS.map((r) => (
              <li
                key={r}
                className="flex items-center gap-4 rounded-2xl border border-line bg-bg-raised p-4"
              >
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white"
                >
                  ✓
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Rider questions
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map(([q, a]) => (
              <details
                key={q}
                className="group rounded-2xl border border-line bg-bg-raised p-5 open:border-brand"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="text-2xl leading-none text-brand transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-4xl bg-brand px-6 py-14 text-center text-white md:py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Ready to ride with KoulriaGo?
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-lg text-lg text-white/95">
            Reach out to support to start the vetting process and get the rider
            app.
          </p>
          <Link
            href={CONTACT_HREF}
            className="inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-brand-deep transition hover:bg-brand-tint"
          >
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}