import Link from "next/link";
import {
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";

const audiences = [
  {
    title: "Buyers",
    body: "Build a real search profile, compare homes, and enquire without being chased before you are ready.",
    href: "/for-buyers",
    label: "For buyers",
  },
  {
    title: "Private sellers",
    body: "Sign up once, get a draft listing from your details, add photos, and publish when it is ready.",
    href: "/for-private-sellers",
    label: "For sellers",
  },
  {
    title: "Agents",
    body: "Receive fewer, better leads with buyer readiness, property fit, and Mia's suggested next action.",
    href: "/for-agents",
    label: "For agents",
  },
];

const flow = [
  ["Profile", "HeyMies captures the buyer or seller context upfront."],
  ["Match", "Listings are checked against buyer preferences and budget."],
  ["Qualify", "Enquiries are checked for readiness, finance, and fit."],
  ["Nurture", "Mia follows up with human-style one-click questions."],
  ["Handover", "Agents receive the buyer when the signal is strong."],
];

export default function HomePage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Lead intelligence for real estate"
        title="HeyMies turns property enquiries into ready-to-buy conversations."
        subtitle="Mia qualifies buyers, follows up automatically, sends better matches, and hands over cleaner leads to agents and sellers when the timing is right."
        primary={{ href: "/signup", label: "Start with HeyMies" }}
        secondary={{ href: "/how-it-works", label: "See the engine" }}
        graphic="pipeline"
      />

      <TechSection title="One platform, three smoother journeys" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          {audiences.map((item) => (
            <TechCard key={item.title}>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.body}</p>
              <Link
                href={item.href}
                className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
              >
                {item.label}
              </Link>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="What makes HeyMies different">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <TechCard>
            <p className="tech-kicker">Mia from HeyMies</p>
            <h2 className="mt-3 text-2xl font-semibold">
              The follow-up happens before the agent loses momentum.
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              A buyer enquiry is not automatically treated as a hot lead. Mia checks
              finance, intent, fit, and timing first. Buyers who need guidance stay in
              nurture. Buyers who are ready are handed over with context.
            </p>
          </TechCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <Metric label="Property fit" value="Budget, area, type, beds" />
            <Metric label="Readiness" value="Finance, timeline, viewing intent" />
            <Metric label="Nurture" value="One-click buyer replies" />
            <Metric label="Handover" value="Clear summary for the agent" />
          </div>
        </div>
      </TechSection>

      <TechSection title="From interest to handover" tone="alt">
        <div className="grid gap-4 md:grid-cols-5">
          {flow.map(([title, body], index) => (
            <TechCard key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-emerald-200">
                {index + 1}
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Less noise. Better timing.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Whether you are buying, selling privately, or working leads as an agent,
              HeyMies keeps the process moving toward real conversations.
            </p>
          </div>
          <Link href="/signup" className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
            Create account
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <TechCard>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </TechCard>
  );
}
