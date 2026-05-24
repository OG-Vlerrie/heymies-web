import Link from "next/link";
import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const stages = [
  ["Profile", "Buyers and sellers give HeyMies the context needed to avoid guesswork."],
  ["Listing", "Agents and sellers add homes. Private seller signups can become draft listings."],
  ["Match", "HeyMies compares buyer needs with price, area, type, bedrooms, and bathrooms."],
  ["Enquire", "A buyer can only enquire once they are registered, so Mia already has useful data."],
  ["Qualify", "Readiness, finance, property fit, and viewing intent decide the next step."],
  ["Nurture", "Mia follows up automatically until the buyer is clearer, warmer, or ready."],
  ["Handover", "Agents receive the lead with a summary, score, and recommended action."],
];

export default function HowItWorksPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="How it works"
        title="The HeyMies engine follows up until the timing is right."
        subtitle="HeyMies captures real context, scores fit and readiness, lets Mia nurture uncertain buyers, and hands over cleaner opportunities."
        primary={{ href: "/signup", label: "Start now" }}
        secondary={{ href: "/listings", label: "Browse listings" }}
        graphic="pipeline"
      />

      <TechSection title="The operating flow" tone="alt">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          {stages.map(([title, body], index) => (
            <TechCard key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-emerald-200">
                {index + 1}
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="What Mia decides">
        <div className="grid gap-5 md:grid-cols-2">
          <TechCard>
            <h2 className="text-xl font-semibold">Ready for handover</h2>
            <p className="mt-3 leading-7 text-slate-700">
              If the buyer has strong property fit, intent, and readiness, the agent gets
              the enquiry with contact details, Mia's read, and a suggested next action.
            </p>
          </TechCard>
          <TechCard>
            <h2 className="text-xl font-semibold">Needs nurture first</h2>
            <p className="mt-3 leading-7 text-slate-700">
              If finance, timing, or fit is unclear, Mia asks a simple question by email
              and records the response before involving the agent.
            </p>
          </TechCard>
        </div>
      </TechSection>

      <TechSection title="The result" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          <Outcome title="Buyers" body="Less pressure and better-matched homes." />
          <Outcome title="Sellers" body="A structured listing flow and cleaner buyer interest." />
          <Outcome title="Agents" body="Fewer cold enquiries and more useful context." />
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Start with the journey that fits you.</h2>
            <p className="mt-3 text-slate-300">Buyer, seller, or agent. HeyMies keeps the next step clear.</p>
          </div>
          <Link href="/signup" className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
            Choose signup
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}

function Outcome({ title, body }: { title: string; body: string }) {
  return (
    <TechCard>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </TechCard>
  );
}
