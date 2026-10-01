import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Help build local commerce in Africa. See open roles at StockedUp in design, video, content, marketing, sales and support.",
};

// TODO: confirm this inbox exists and is monitored before publishing.
const CAREERS_EMAIL = "careers@stockedup.africa";

type Role = {
  title: string;
  team: string;
  where: string;
  summary: string;
  doing: string[];
  needs: string[];
  bonus: string[];
};

// TODO: confirm each role's location and work arrangement (full-time,
// part-time, freelance) before publishing. None are stated on the cards below.
const ROLES: Role[] = [
  {
    title: "Graphic Designer",
    team: "Creative",
    where: "Awka or remote",
    summary:
      "Shape how StockedUp looks everywhere: social posts, flyers, vendor promos and in-app banners.",
    doing: [
      "Design social media graphics, promo banners and campaign visuals",
      "Create flyers, posters and QR materials for vendors and events",
      "Keep every design consistent with the StockedUp brand",
      "Turn rough briefs into clean, finished designs quickly",
    ],
    needs: [
      "A portfolio showing real design work",
      "Strong skills in Figma, Photoshop, Illustrator or Canva",
      "A good eye for layout, colour and typography",
      "Comfortable working to tight deadlines and taking feedback",
    ],
    bonus: [
      "Experience designing for food, retail or delivery brands",
      "Basic motion graphics skills",
    ],
  },
  {
    title: "Video Editor",
    team: "Creative",
    where: "Awka or remote",
    summary:
      "Turn raw footage into short, scroll-stopping videos for TikTok, Instagram and YouTube.",
    doing: [
      "Edit short-form videos, promos and product features",
      "Add captions, music, transitions and branding",
      "Cut vendor and rider stories into engaging content",
      "Deliver edits for each platform's format and length",
    ],
    needs: [
      "A showreel or sample edits, especially short-form",
      "Proficiency in CapCut, Premiere Pro, DaVinci Resolve or similar",
      "A feel for pacing, trends and storytelling",
      "Reliable turnaround on a regular posting schedule",
    ],
    bonus: [
      "Motion graphics or colour grading skills",
      "Experience editing food or lifestyle content",
    ],
  },
  {
    title: "Content Creator",
    team: "Creative",
    where: "Awka",
    summary:
      "Show real vendors, real food and real deliveries in a way that makes people want to order.",
    doing: [
      "Shoot and present videos and photos with vendors, products and riders",
      "Come up with content ideas that fit what's trending",
      "Appear on camera or work behind it, depending on your strengths",
      "Visit shops and kitchens around Awka to capture content",
    ],
    needs: [
      "An active social page or portfolio of content you've created",
      "Confidence in front of or behind a camera",
      "Good phone-filming skills (lighting, framing, sound)",
      "Comfortable with fieldwork and meeting vendors",
    ],
    bonus: [
      "A following in Awka or the wider Anambra area",
      "Experience creating UGC-style or review content",
    ],
  },
  {
    title: "Digital Marketer",
    team: "Marketing",
    where: "Awka or remote",
    summary:
      "Plan and run campaigns that bring new customers and vendors onto StockedUp.",
    doing: [
      "Plan and manage paid and organic campaigns on Meta, TikTok and Google",
      "Grow app installs and first orders in Awka",
      "Track results and improve campaigns using the data",
      "Work with design and content on creatives and launches",
    ],
    needs: [
      "Hands-on experience running ads or digital campaigns",
      "Comfort with analytics and reading campaign metrics",
      "Clear writing and strong campaign thinking",
      "Results you can point to, even from small projects",
    ],
    bonus: [
      "Experience marketing an app or an online marketplace",
      "SEO or email marketing skills",
    ],
  },
  {
    title: "Social Media Manager",
    team: "Marketing",
    where: "Awka or remote",
    summary:
      "Be the voice of StockedUp across our channels and build a community around it.",
    doing: [
      "Run our Instagram, Facebook, X, TikTok and LinkedIn pages",
      "Plan and schedule a consistent content calendar",
      "Reply to comments and messages in the StockedUp tone",
      "Report on growth and engagement, and suggest improvements",
    ],
    needs: [
      "Experience managing social accounts for a brand or business",
      "Strong writing and a feel for what resonates online",
      "Organised, consistent and quick to respond",
      "Understanding of each platform's formats and trends",
    ],
    bonus: [
      "Experience in food, retail or delivery",
      "Basic design or video-editing skills",
    ],
  },
  {
    title: "Copywriter",
    team: "Marketing",
    where: "Remote",
    summary:
      "Write the words people read before they order: captions, ads, emails, app copy and blog posts.",
    doing: [
      "Write ad copy, captions, emails and push notifications",
      "Write clear, friendly in-app and website copy",
      "Draft blog posts and vendor success stories",
      "Edit and polish writing to keep our voice consistent",
    ],
    needs: [
      "Writing samples that show range",
      "Excellent English, with the ability to write in a casual, local-friendly tone",
      "Ability to turn a brief into short, punchy copy",
      "Attention to detail and deadlines",
    ],
    bonus: [
      "Experience with performance or conversion copy",
      "Pidgin or Igbo fluency for local campaigns",
    ],
  },
  {
    title: "Vendor Onboarding & Sales Executive",
    team: "Sales",
    where: "Awka (field)",
    summary:
      "Bring the best local shops, restaurants and supermarkets onto StockedUp and help them get selling.",
    doing: [
      "Visit businesses around Awka and pitch StockedUp",
      "Walk vendors through registration and setting up their shop",
      "Follow up to help new vendors list products and get their first orders",
      "Report back on what vendors need to succeed",
    ],
    needs: [
      "Confident, friendly communicator who is comfortable approaching strangers",
      "Good knowledge of Awka's markets, shops and restaurants",
      "Basic smartphone and app skills to guide vendors",
      "Self-driven and comfortable working in the field",
    ],
    bonus: [
      "Previous sales, field sales or business development experience",
      "Existing relationships with local vendors",
    ],
  },
  {
    title: "Customer Support Associate",
    team: "Operations",
    where: "Awka or remote",
    summary:
      "Be the helpful voice customers, vendors and riders reach when they need a hand.",
    doing: [
      "Answer customer, vendor and rider questions by chat, phone and email",
      "Resolve order issues quickly and kindly, working with vendors and riders",
      "Log common problems so we can fix them at the source",
      "Help vetted riders get set up with the rider app",
    ],
    needs: [
      "Clear, patient and professional communication",
      "Calm problem-solving under pressure",
      "Comfortable with chat tools and basic apps",
      "Reliable and available during busy ordering hours",
    ],
    bonus: [
      "Previous customer service experience",
      "Fluency in Igbo or Pidgin alongside English",
    ],
  },
];

const STEPS = [
  [
    "01",
    "Apply",
    "Click Apply on a role. Your email opens with a short template. Add your portfolio, samples or profile links.",
  ],
  [
    "02",
    "We review",
    "Our team looks through your work and how closely you match the role.",
  ],
  [
    "03",
    "Task or chat",
    "Shortlisted candidates may get a short practical task or a conversation with the team.",
  ],
  [
    "04",
    "Join the team",
    "If it's a good fit on both sides, we'll talk through next steps and get you started.",
  ],
] as const;

function applyHref(title: string) {
  const subject = encodeURIComponent(`Application: ${title}`);
  const body = encodeURIComponent(
    [
      `Role: ${title}`,
      "",
      "Full name:",
      "Phone / WhatsApp:",
      "Location:",
      "Portfolio / social / LinkedIn link:",
      "",
      "Why you're a good fit (a few lines):",
      "",
    ].join("\n")
  );
  return `mailto:${CAREERS_EMAIL}?subject=${subject}&body=${body}`;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-ink-soft">
          <span
            aria-hidden
            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
          />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="stamp text-brand-deep">We&apos;re hiring</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Help us build local commerce in Africa.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            StockedUp connects people with food, groceries, supermarkets and
            local shops, delivered to their doorstep by KoulriaGo. We&apos;re
            growing, and we&apos;re looking for creative, driven people to grow
            with us.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#roles"
              className="inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
            >
              See open roles
            </Link>
            <Link
              href="#how-we-hire"
              className="inline-flex rounded-full border border-line bg-bg-raised px-7 py-3.5 font-bold text-ink transition hover:border-brand"
            >
              How we hire
            </Link>
          </div>
        </div>
      </section>

      {/* What we're building */}
      <section className="bg-brand-tint py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {[
            [
              "Local first",
              "We put the businesses around you, from market stalls to supermarkets, in front of more customers.",
            ],
            [
              "Built for Nigeria",
              "Operating in Awka, Anambra, with products designed around how people here actually shop and eat.",
            ],
            [
              "Small team, big impact",
              "You'll own real work, see it go live quickly and help shape how StockedUp grows.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl bg-bg-raised p-7">
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-28 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Open roles
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
            Open a role to see what you&apos;d do and what we&apos;re looking
            for. Meet most of the requirements? Apply, even if you don&apos;t
            tick every box.
          </p>

          <div className="mt-12 space-y-4">
            {ROLES.map((r) => (
              <details
                key={r.title}
                className="group rounded-3xl border border-line bg-bg-raised p-6 open:border-brand"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div>
                    <h3 className="font-display text-xl font-bold sm:text-2xl">
                      {r.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="stamp text-brand-deep">{r.team}</span>
                      <span className="stamp text-ink-soft">{r.where}</span>
                    </div>
                    <p className="mt-3 text-ink-soft">{r.summary}</p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-1 text-3xl leading-none text-brand transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <div className="mt-6 space-y-6 border-t border-line pt-6">
                  <div>
                    <h4 className="font-display text-lg font-bold">
                      What you&apos;ll do
                    </h4>
                    <List items={r.doing} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold">
                      What we&apos;re looking for
                    </h4>
                    <List items={r.needs} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold">
                      Nice to have
                    </h4>
                    <List items={r.bonus} />
                  </div>
                  <a
                    href={applyHref(r.title)}
                    className="inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
                  >
                    Apply for this role
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* How we hire */}
      <section id="how-we-hire" className="scroll-mt-28 bg-brand-tint py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How we hire
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, title, text]) => (
              <li
                key={n}
                className="rounded-[1.75rem] border border-line bg-bg-raised p-7"
              >
                <span className="tabular text-5xl font-semibold text-brand">
                  {n}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Don't see your role */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-4xl bg-brand px-6 py-14 text-center text-white md:py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Don&apos;t see your role?
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-lg text-lg text-white/95">
            We&apos;re always interested in talented people. Send us your work
            and tell us how you&apos;d like to help build StockedUp.
          </p>
          <a
            href={applyHref("General application")}
            className="inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-brand-deep transition hover:bg-brand-tint"
          >
            Send a general application
          </a>
        </div>
      </section>
    </>
  );
}