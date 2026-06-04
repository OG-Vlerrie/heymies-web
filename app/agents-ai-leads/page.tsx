import type { Metadata } from "next";
import Link from "next/link";
import {
  TechCard,
  TechFooter,
  TechSection,
} from "@/components/TechPage";

export const metadata: Metadata = {
  title: "AI Lead Scoring for Estate Agents | HeyMies",
  description:
    "HeyMies helps South African estate agents score, track, and nurture buyer leads so teams can focus on serious clients.",
};

const painPoints = [
  {
    title: "Too many cold enquiries",
    body: "Every portal ping looks urgent until your team spends time finding out the buyer is browsing casually.",
  },
  {
    title: "Buyers ghost after one message",
    body: "Follow-up gets harder when buyers go quiet before finance, timing, and intent are clear.",
  },
  {
    title: "Agents waste hours on poor-fit leads",
    body: "Valuable call time gets pulled into buyers who are outside budget, unsure, or not ready to view.",
  },
];

const productFeatures = [
  {
    title: "AI buyer scoring",
    body: "HeyMies reads buyer signals across fit, urgency, finance context, and engagement to surface the strongest opportunities.",
  },
  {
    title: "Automated nurturing emails",
    body: "Mia keeps uncertain buyers warm with timely follow-ups before they are ready for agent handover.",
  },
  {
    title: "Buyer activity tracking",
    body: "Agents can see which buyers keep returning, saving homes, and taking meaningful next steps.",
  },
  {
    title: "Qualified buyer alerts",
    body: "When intent becomes clear, your team gets a cleaner alert with the context needed for a better first conversation.",
  },
];

const benefits = [
  "Save time",
  "Improve follow-up",
  "Prioritise serious buyers",
  "Increase conversion opportunities",
];

const dashboardActivity = [
  "Viewed listing 5 times",
  "Saved 3 properties",
  "Requested bond assistance",
];

export default function AgentsAiLeadsPage() {
  return (
    <main className="tech-page">
      <section className="tech-hero overflow-hidden px-4 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
              For South African estate agents
            </p>
            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
              Stop wasting time on junk property leads.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              HeyMies uses AI to score, track and nurture buyers so agents can
              focus on serious clients.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/?source=agents-ai-leads-page#agency-demo"
                className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Book a Demo
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/16"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {["Score the buyer", "Nurture the maybe", "Alert the agent"].map(
              (label, index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/15 text-sm font-bold text-emerald-100">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-semibold text-white">{label}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-400"
                      style={{ width: `${70 + index * 10}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <TechSection title="Why agent teams lose momentum" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          {painPoints.map((point) => (
            <TechCard key={point.title}>
              <h2 className="text-lg font-semibold text-slate-950">
                {point.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{point.body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="How HeyMies qualifies buyer demand">
        <div
          id="how-it-works"
          className="grid scroll-mt-24 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {productFeatures.map((feature) => (
            <TechCard key={feature.title}>
              <h2 className="text-lg font-semibold text-slate-950">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {feature.body}
              </p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="A cleaner view of buyer intent" tone="alt">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="tech-kicker">Demo visual</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
              See the buyer behind the enquiry.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-700">
              HeyMies helps your team separate casual clicks from meaningful
              activity, then highlights the buyers worth immediate follow-up.
            </p>
          </div>

          <div className="tech-panel rounded-2xl p-5">
            <div className="rounded-2xl bg-[#07111f] p-5 text-white">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                    Buyer profile
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">Thabo M.</h3>
                </div>
                <span className="w-fit rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-100">
                  High Intent
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-sm text-slate-400">Score</p>
                  <p className="mt-2 text-4xl font-semibold">92/100</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-300 to-sky-400" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-sm font-semibold text-slate-200">Activity</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    {dashboardActivity.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TechSection>

      <TechSection title="What agents get back">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <TechCard key={benefit}>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-semibold text-slate-950">{benefit}</h2>
              </div>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight">
              Ready to turn noisy enquiries into qualified buyers?
            </h2>
          </div>
          <Link
            href="/?source=agents-ai-leads-page#agency-demo"
            className="tech-button-primary w-fit rounded-xl px-6 py-3 text-sm font-semibold"
          >
            Book a Demo
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}
