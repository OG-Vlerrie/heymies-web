import Link from "next/link";
import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const stages = [
  ["Profile", "Buyers and sellers give HeyMies the context needed to avoid guesswork."],
  ["Listing", "Agents and sellers add homes. Private seller signups can become draft listings."],
  ["Match", "HeyMies compares buyer needs with price, area, type, bedrooms, and bathrooms."],
  ["Enquire", "A buyer can only enquire once they are registered, so Mia already has useful data."],
  ["Qualify", "Readiness, finance, property fit, and viewing intent decide the next step."],
  ["Nurture", "Mia follows up automatically until the buyer is clearer, warmer, or ready."],
  ["Handover", "Agents receive the lead with a summary, readiness context, and recommended action."],
];

export default function HowItWorksPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="How it works"
        title="The HeyMies engine follows up until the timing is right."
        subtitle="HeyMies captures real context, checks fit and readiness, lets Mia nurture uncertain buyers, and hands over cleaner opportunities."
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
            <h2 className="text-xl font-semibold">Ready for an agent conversation</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Mia only moves a buyer forward when the enquiry has enough context for a
              useful first call. That means the property looks like a strong fit, the
              buyer has shown clear intent, and the next step is obvious.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li>The agent receives the buyer's contact details.</li>
              <li>Mia includes a short summary of readiness, fit, and finance signals.</li>
              <li>The handover includes a recommended next action, such as call, confirm viewing, or check finance.</li>
            </ul>
          </TechCard>
          <TechCard>
            <h2 className="text-xl font-semibold">Needs nurture first</h2>
            <p className="mt-3 leading-7 text-slate-700">
              When the buyer is interested but not quite ready for a useful agent call,
              Mia keeps the conversation warm instead of pushing the enquiry through too
              early. The goal is to clear up the missing context first.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li>Mia asks a focused follow-up about finance, timing, intent, or property fit.</li>
              <li>The buyer's response is recorded against the enquiry for future context.</li>
              <li>The agent only gets involved once the next step is clearer or the buyer asks for contact.</li>
            </ul>
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
