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
        title="A smarter operating layer for real estate leads."
        subtitle="HeyMies filters, scores, and nurtures property leads so agents and sellers can focus on real conversations with real momentum."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/how-it-works", label: "See how it works" }}
        graphic="score"
      />

      <TechSection title="What is HeyMies?" tone="alt">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 text-slate-700">
            <p>
              HeyMies is a real estate technology platform built to help property
              professionals focus on what closes deals: qualified buyers, useful
              context, and timely hand-offs.
            </p>
            <p>
              The South African real estate market is noisy. Agents are flooded
              with enquiries that go nowhere, admin eats into selling time, and
              lead quality is unpredictable. HeyMies exists to fix that.
            </p>
            <p>
              We filter, score, and nurture property leads using intelligent
              automation, then deliver ready-to-engage prospects at the right
              moment.
            </p>
          </div>
          <TechCard>
            <p className="tech-kicker">Platform signal</p>
            <div className="mt-5 grid gap-3">
              <Metric label="Lead quality" value="High intent" />
              <Metric label="Agent workload" value="Reduced admin" />
              <Metric label="Buyer journey" value="Guided follow-up" />
            </div>
          </TechCard>
        </div>
      </TechSection>

      <TechSection title="What we do">
        <div className="grid gap-4 md:grid-cols-2">
          <TechCard>Capture and organise buyer enquiries</TechCard>
          <TechCard>Filter low-intent and poor-quality leads</TechCard>
          <TechCard>Nurture genuine buyers automatically</TechCard>
          <TechCard>Score readiness and timing before hand-off</TechCard>
        </div>
      </TechSection>

      <TechSection title="Our principles" tone="alt">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Simplicity", "Easy to use. No bloat."],
            ["Precision", "Fewer leads, higher intent."],
            ["Trust", "Clear scoring. Clear outcomes."],
            ["Local Impact", "Built for South African realities."],
            ["Speed", "Faster response, faster decisions."],
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
