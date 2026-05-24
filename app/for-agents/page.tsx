import Link from "next/link";
import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const agentSignals = [
  ["Readiness score", "How close the buyer appears to action."],
  ["Property fit", "How well the listing matches budget, area, and needs."],
  ["Finance context", "Whether the buyer is pre-approved, cash-ready, or needs help."],
  ["Mia's read", "A short summary and the suggested next action."],
];

const nurtureOutcomes = [
  ["Agent-ready", "The buyer is handed over with contact details and context."],
  ["Finance nurture", "Mia checks pre-approval before agent involvement."],
  ["Needs confirmation", "Mia asks whether the buyer wants contact now."],
  ["Better-fit nurture", "Mia keeps the buyer warm while watching for stronger matches."],
];

export default function ForAgentsPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="For agents"
        title="Spend less time chasing and more time with ready buyers."
        subtitle="HeyMies qualifies enquiries before handover, so your dashboard shows buyer readiness, property fit, finance context, and Mia's recommended next action."
        primary={{ href: "/signup/agent", label: "Join as agent" }}
        secondary={{ href: "/how-it-works", label: "See the workflow" }}
        graphic="score"
      />

      <TechSection title="The problem is not lead volume" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          <Pain title="Cold enquiries" body="Buyers ask once, disappear, or were never ready for a call." />
          <Pain title="Missing context" body="Agents often receive a name and number without finance, fit, or timing." />
          <Pain title="Manual nurture" body="Follow-up happens when someone has time, which is usually too late." />
        </div>
      </TechSection>

      <TechSection title="What the agent receives">
        <div className="grid gap-5 md:grid-cols-4">
          {agentSignals.map(([title, body]) => (
            <TechCard key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="What Mia does before handover" tone="alt">
        <div className="grid gap-5 md:grid-cols-4">
          {nurtureOutcomes.map(([title, body]) => (
            <TechCard key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="Why this matters">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <TechCard>
            <p className="tech-kicker">Agent workflow</p>
            <h2 className="mt-3 text-2xl font-semibold">Your first call starts warmer.</h2>
            <p className="mt-4 leading-7 text-slate-700">
              A HeyMies lead is not just an enquiry. It carries behaviour, match quality,
              readiness, buyer response history, and the next best action. That means the
              agent can call with purpose instead of opening with discovery from zero.
            </p>
          </TechCard>
          <TechCard>
            <h2 className="text-xl font-semibold">Best fit for agents who want</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Fewer but better conversations.</li>
              <li>Clearer buyer intent before calling.</li>
              <li>Automatic follow-up on uncertain buyers.</li>
              <li>Visibility into which leads are becoming ready.</li>
            </ul>
          </TechCard>
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Work the leads worth working.</h2>
            <p className="mt-3 text-slate-300">Join the agent pilot and help shape the handover standard.</p>
          </div>
          <Link href="/signup/agent" className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
            Join as agent
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}

function Pain({ title, body }: { title: string; body: string }) {
  return (
    <TechCard>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </TechCard>
  );
}
