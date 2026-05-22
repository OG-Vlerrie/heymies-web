import {
  TechCTA,
  TechCard,
  TechHero,
  TechSection,
} from "@/components/TechPage";

export default function HowItWorksPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="How it works"
        title="From raw enquiry to ready buyer."
        subtitle="HeyMies captures buyer interest, scores readiness, follows up automatically, and hands off only the strongest opportunities."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/pricing", label: "View pricing" }}
        graphic="pipeline"
      />

      <TechSection title="The operating flow" tone="alt">
        <div className="grid gap-5 md:grid-cols-4">
          <Step
            n="1"
            title="Capture"
            text="Buyers enter through listings, ads, or campaigns. No agent involvement required."
          />
          <Step
            n="2"
            title="Score"
            text="HeyMies evaluates behaviour, engagement, timeframe, and intent."
          />
          <Step
            n="3"
            title="Nurture"
            text="Automated follow-ups keep buyers warm until they're ready to act."
          />
          <Step
            n="4"
            title="Hand-off"
            text="Only qualified, ready buyers are sent to the agent to close."
          />
        </div>
      </TechSection>

      <TechSection title="What changes for the agent">
        <div className="grid gap-6 md:grid-cols-2">
          <TechCard>
            <h3 className="text-xl font-semibold">What the agent gets</h3>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li>A buyer who has engaged multiple times</li>
              <li>Clear intent and timeframe</li>
              <li>Context before the first call</li>
              <li>No chasing or guessing</li>
            </ul>
          </TechCard>

          <TechCard>
            <h3 className="text-xl font-semibold">What disappears</h3>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li>Junk enquiries</li>
              <li>Cold leads</li>
              <li>Endless follow-ups</li>
              <li>Paying for noise</li>
            </ul>
          </TechCard>
        </div>
      </TechSection>

      <TechCTA
        title="Built for agents who value their time"
        body="Join early and be notified when onboarding opens."
        href="/signup"
        label="Join HeyMies"
      />
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <TechCard>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-emerald-200">
          {n}
        </span>
        <strong>{title}</strong>
      </div>
      <p className="text-sm text-slate-700">{text}</p>
    </TechCard>
  );
}
