import Image from "next/image";
import Link from "next/link";
import LeadForm from "./LeadForm";



/* ----------------------------- PAGE ----------------------------- */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
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

/* ----------------------------- HEADER ----------------------------- */





/* ----------------------------- HERO ----------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* background */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.25) 35%, rgba(16,185,129,0.12) 60%, transparent 85%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-20 pb-24 text-center">
        {/* Logo */}
        <img
          src="/logo.svg"
          alt="HeyMies"
          className="mb-10 h-[280px] w-auto"
        />

        {/* Headline */}
        <h1 className="text-4xl font-semibold md:text-5xl">
          Intelligent automation for real estate lead generation.
        </h1>

        {/* Subcopy */}
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          Stop paying for bad leads. No bloated CRM. No junk enquiries. Just buyers.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/signup"
            className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Join HeyMies
          </a>
          <a
            href="/how-it-works"
            className="rounded-xl border border-slate-300 px-7 py-3 text-sm font-semibold hover:bg-white/60"
          >
            See how it works
          </a>
        </div>

        {/* Slogan */}
        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </section>
  );
}








/* ----------------------------- PROBLEM ----------------------------- */

function Problem() {
  return (
    <Section title="The real estate market has a lead problem." tone="blue">
      <Grid cols={2}>
        <Card>You’re sold volume, not quality.</Card>
        <Card>Bad leads drain time and momentum.</Card>
        <Card>Competition between agents keeps increasing.</Card>
        <Card>Efficiency is now survival.</Card>
      </Grid>
      <p className="mt-6 font-semibold">More leads don’t close more deals. Better leads do.</p>
    </Section>
  );
}

/* ----------------------------- SOLUTION ----------------------------- */

function Solution() {
  return (
    <Section title="HeyMies removes the noise." tone="green">
      <p className="max-w-2xl text-slate-700">
        HeyMies qualifies intent, timing, and seriousness before a lead reaches you. You engage
        later — but stronger.
      </p>
    </Section>
  );
}

/* ----------------------------- HOW IT WORKS ----------------------------- */

function HowItWorks() {
  return (
    <Section id="how-it-works" title="How it works" tone="blue">
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

/* ----------------------------- BENEFITS ----------------------------- */

function Benefits() {
  return (
    <Section title="Why agents choose HeyMies" tone="green">
      <Grid cols={3}>
        <Card>Less admin. No chasing.</Card>
        <Card>Higher intent conversations.</Card>
        <Card>More control of your time.</Card>
      </Grid>
    </Section>
  );
}

/* ----------------------------- COMPARISON ----------------------------- */

function Comparison() {
  return (
    <Section title="Portals vs HeyMies" tone="blue">
      <Grid cols={2}>
        <Card>
          <strong>Traditional portals</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Pay for exposure</li>
            <li>Compete on speed</li>
            <li>Chase everyone</li>
          </ul>
        </Card>
        <Card>
          <strong>HeyMies</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Pay for readiness</li>
            <li>Compete on relevance</li>
            <li>Speak when it matters</li>
          </ul>
        </Card>
      </Grid>
    </Section>
  );
}

/* ----------------------------- FIT ----------------------------- */

function Fit() {
  return (
    <Section title="Who it’s for" tone="green">
      <Grid cols={2}>
        <Card>
          <strong>Good fit if you:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Want fewer, better conversations</li>
            <li>Value efficiency</li>
          </ul>
        </Card>
        <Card>
          <strong>Not for you if:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Want every enquiry</li>
            <li>Enjoy cold calling</li>
          </ul>
        </Card>
      </Grid>
    </Section>
  );
}

/* ----------------------------- CTA ----------------------------- */

function FinalCTA() {
  return (
    <section id="join" className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">Stop chasing. Start closing.</h2>
        <p className="mt-3 text-slate-300">Early access for agents.</p>
        <LeadForm source="homepage-cta" />
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */

function Footer() {
  return (
    <footer className="border-t px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}

/* ----------------------------- UI HELPERS ----------------------------- */

function Section({
  id,
  title,
  children,
  tone = "none",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  tone?: "none" | "blue" | "green";
}) {
  const bg =
    tone === "blue"
      ? "bg-blue-50"
      : tone === "green"
      ? "bg-emerald-50"
      : "bg-white";

  return (
    <section id={id} className={bg}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">{title}</h2>
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
  return <div className="rounded-xl border border-slate-200 bg-white p-5">{children}</div>;
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
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
          {n}
        </span>
        <strong>{title}</strong>
      </div>
      <p className="text-sm text-slate-700">{children}</p>
    </Card>
  );
}
