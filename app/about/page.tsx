import {
  TechCTA,
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";

export default function AboutPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="About HeyMies"
        title="HeyMies is the follow-up layer between interest and action."
        subtitle="We help buyers move at their own pace, sellers create cleaner listings, and agents receive leads when they are actually worth the call."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/how-it-works", label: "See how it works" }}
        graphic="score"
      />

      <TechSection title="What is HeyMies?" tone="alt">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 text-slate-700">
            <p>
              HeyMies is a real estate technology platform built around one simple
              belief: every property enquiry needs context before it becomes an
              agent conversation.
            </p>
            <p>
              Buyers want help without pressure. Sellers want serious interest,
              not noise. Agents want to know who is worth calling first. Mia from
              HeyMies helps coordinate that middle ground.
            </p>
            <p>
              We match listings, qualify enquiries, nurture uncertain buyers, and
              hand over ready opportunities with a clear summary and next action.
            </p>
          </div>
          <TechCard>
            <p className="tech-kicker">Platform signal</p>
            <div className="mt-5 grid gap-3">
              <Metric label="Buyer journey" value="Guided by Mia" />
              <Metric label="Seller flow" value="Draft to publish" />
              <Metric label="Agent handover" value="Ready with context" />
            </div>
          </TechCard>
        </div>
      </TechSection>

      <TechSection title="What we do">
        <div className="grid gap-4 md:grid-cols-2">
          <TechCard>Turn buyer profiles into better listing matches</TechCard>
          <TechCard>Create seller draft listings from signup details</TechCard>
          <TechCard>Ask buyers the follow-up questions agents need answered</TechCard>
          <TechCard>Hand over qualified leads with readiness and fit context</TechCard>
        </div>
      </TechSection>

      <TechSection title="Our principles" tone="alt">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Human first", "Automation should feel useful, not robotic."],
            ["Context matters", "A lead is only useful when the next action is clear."],
            ["Less noise", "Fewer cold conversations. Better-timed handovers."],
            ["Local reality", "Built around South African property workflows."],
            ["Momentum", "Every flow should move the user closer to action."],
          ].map(([title, body]) => (
            <TechCard key={title}>
              <strong>{title}</strong>
              <p className="mt-2 text-sm text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechCTA
        title="Ready to remove the noise?"
        body="Join HeyMies and start working with better leads."
        href="/signup"
        label="Get started"
      />
      <TechFooter />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
