import Image from "next/image";
import Link from "next/link";
import { HOME_ROUTES } from "./routes";

const FEATURES = [
  "Verified riders",
  "Automatic rider assignment",
  "Real-time location tracking",
  "Doorstep delivery",
  "Order status updates",
];
const STAGES = ["Confirmed", "Rider assigned", "Picked up", "Delivered"];

export function KoulriaGo() {
  return (
    <section id="riders" className="bg-brand py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Delivered by KoulriaGo.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/90">
            Our dedicated rider network gets your StockedUp orders to you safely
            and on time.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 font-medium">
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand"
                >
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-white/85">
            KoulriaGo powers every StockedUp delivery.{" "}
            <Link
              href={HOME_ROUTES.riderSignup}
              className="font-bold text-white underline hover:no-underline"
            >
              Become a rider
            </Link>
          </p>
        </div>

        {/* Photo: drop a real Nigerian rider image at public/home/koulriago-rider.jpg */}
        <div className="relative h-112 overflow-hidden rounded-4xl bg-white/10">
          <Image
            src="/home/koulriago-rider.jpg"
            alt="A KoulriaGo rider on a delivery in Awka"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />

          <div
            aria-hidden
            className="absolute inset-x-4 bottom-4 rounded-3xl bg-bg-raised p-4 text-ink shadow-2xl"
          >
            <div className="relative h-28 overflow-hidden rounded-2xl bg-brand-tint">
              <svg viewBox="0 0 400 112" className="size-full" preserveAspectRatio="xMidYMid slice">
                <g stroke="white" strokeWidth="10" fill="none" strokeLinecap="round">
                  <path d="M0 30L400 50M0 90L400 70M110 0L130 112M290 0L270 112" />
                </g>
                <path
                  id="route"
                  d="M30 95C90 80 120 60 190 56S320 40 370 18"
                  stroke="#ff7c09"
                  strokeWidth="4"
                  strokeDasharray="2 9"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="370" cy="18" r="8" fill="#211a14" />
                <circle r="9" fill="#ff7c09" stroke="white" strokeWidth="3">
                  <animateMotion dur="8s" repeatCount="indefinite">
                    <mpath href="#route" />
                  </animateMotion>
                </circle>
              </svg>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-bold">
              <span className="tabular">Order #SU-2048</span>
              <span className="stamp text-brand-deep">On the way</span>
            </div>
            <ol className="mt-3 grid grid-cols-4 gap-1.5 text-[0.65rem] text-ink-soft">
              {STAGES.map((s, i) => (
                <li key={s}>
                  <div className={`mb-1 h-1.5 rounded-full ${i < 3 ? "bg-brand" : "bg-line"}`} />
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}