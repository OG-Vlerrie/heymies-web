import LeadForm from "./LeadForm";

export default function HomePage() {
  return (
    <main className="tech-page">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Benefits />
      <Comparison />
      <Fit />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="tech-hero">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="min-w-0">
          <div className="inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
            Smart. Simple. Sorted.
          </div>

          <img
            src="/logo.svg"
            alt="HeyMies"
            className="mt-8 h-28 w-auto rounded-3xl bg-white/95 p-3 shadow-2xl md:h-36"
          />

          <h1 className="mt-8 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-6xl">
            <span className="block">Intelligent lead</span>
            <span className="block">automation for</span>
            <span className="block">modern real estate teams.</span>
          </h1>

          <p className="mt-6 max-w-[21rem] text-lg leading-8 text-slate-300 sm:max-w-2xl">
            HeyMies qualifies intent, timing, and readiness before a buyer reaches
            your pipeline. Less chasing, sharper conversations, cleaner hand-offs.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/signup"
              className="tech-button-primary rounded-xl px-7 py-3 text-sm font-semibold"
            >
              Join HeyMies
            </a>
            <a
              href="/how-it-works"
              className="rounded-xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/16"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="tech-panel min-w-0 max-w-[22rem] rounded-3xl p-5 text-slate-900 sm:max-w-none">
          <div className="rounded-2xl border border-slate-900/10 bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                  Lead engine
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Qualification stream
                </h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
                Live
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <Signal label="Intent score" value="87" tone="emerald" />
              <Signal label="Timeline" value="30 days" tone="sky" />
              <Signal label="Finance readiness" value="Pre-approved" tone="slate" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="text-sm text-slate-300">Next best action</p>
              <p className="mt-1 text-lg font-semibold">
                Route buyer to agent after automated follow-up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <Section title="The real estate market has a lead problem." tone="alt">
      <Grid cols={2}>
        <Card>You're sold volume, not quality.</Card>
        <Card>Bad leads drain time and momentum.</Card>
        <Card>Competition between agents keeps increasing.</Card>
        <Card>Efficiency is now survival.</Card>
      </Grid>
      <p className="mt-6 font-semibold">
        More leads don't close more deals. Better leads do.
      </p>
    </Section>
  );
}

function Solution() {
  return (
    <Section title="HeyMies removes the noise.">
      <p className="max-w-2xl text-slate-700">
        HeyMies qualifies intent, timing, and seriousness before a lead reaches
        you. You engage later, but stronger.
      </p>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section id="how-it-works" title="How it works" tone="alt">
      <Grid cols={4}>
        <Step n="1" title="Capture">
          Leads enter from listings or campaigns.
        </Step>
        <Step n="2" title="Score">
          Behaviour and readiness are evaluated.
        </Step>
        <Step n="3" title="Nurture">
          Buyers are followed up automatically.
        </Step>
        <Step n="4" title="Hand-off">
          Only ready buyers reach the agent.
        </Step>
      </Grid>
    </Section>
  );
}

function Benefits() {
  return (
    <Section title="Why agents choose HeyMies">
      <Grid cols={3}>
        <Card>Less admin. No chasing.</Card>
        <Card>Higher intent conversations.</Card>
        <Card>More control of your time.</Card>
      </Grid>
    </Section>
  );
}

function Comparison() {
  return (
    <Section title="Portals vs HeyMies" tone="alt">
      <Grid cols={2}>
        <Card>
          <strong>Traditional portals</strong>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Pay for exposure</li>
            <li>Compete on speed</li>
            <li>Chase everyone</li>
          </ul>
        </Card>
        <Card>
          <strong>HeyMies</strong>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Pay for readiness</li>
            <li>Compete on relevance</li>
            <li>Speak when it matters</li>
          </ul>
        </Card>
      </Grid>
    </Section>
  );
}

function Fit() {
  return (
    <Section title="Who it's for">
      <Grid cols={2}>
        <Card>
          <strong>Good fit if you:</strong>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Want fewer, better conversations</li>
            <li>Value efficiency</li>
          </ul>
        </Card>
        <Card>
          <strong>Not for you if:</strong>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Want every enquiry</li>
            <li>Enjoy cold calling</li>
          </ul>
        </Card>
      </Grid>
    </Section>
  );
}

function FinalCTA() {
  return (
    <section id="join" className="tech-hero px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">Stop chasing. Start closing.</h2>
        <p className="mt-3 text-slate-300">Early access for agents.</p>
        <LeadForm source="homepage-cta" />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">
        © {new Date().getFullYear()} HeyMies
      </div>
    </footer>
  );
}

function Section({
  id,
  title,
  children,
  tone = "none",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  tone?: "none" | "alt";
}) {
  return (
    <section id={id} className={tone === "alt" ? "tech-section-alt" : "tech-section"}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Grid({
  cols = 2,
  children,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const mdCols =
    cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return <div className={`grid gap-4 ${mdCols}`}>{children}</div>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="tech-card rounded-2xl p-5">{children}</div>;
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-emerald-200">
          {n}
        </span>
        <strong>{title}</strong>
      </div>
      <p className="text-sm text-slate-700">{children}</p>
    </Card>
  );
}

function Signal({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "sky" | "slate";
}) {
  const color =
    tone === "emerald"
      ? "from-emerald-300 to-emerald-500"
      : tone === "sky"
      ? "from-sky-300 to-cyan-500"
      : "from-slate-300 to-slate-500";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full w-4/5 rounded-full bg-gradient-to-r ${color}`} />
      </div>
    </div>
  );
}
