import Link from "next/link";

/* ----------------------------- PAGE ----------------------------- */

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

      <Section title="What is HeyMies?" tone="blue">
        <p className="max-w-3xl text-slate-700">
          HeyMies is a South African real estate platform that removes the noise from lead generation.
          We qualify intent, nurture buyers, and only hand off leads when they’re ready to act.
        </p>
      </Section>

      <Section title="What we do" tone="green">
        <Grid cols={2}>
          <Card>Capture and organise buyer enquiries</Card>
          <Card>Filter low-intent and poor-quality leads</Card>
          <Card>Nurture genuine buyers automatically</Card>
          <Card>Score readiness and timing before hand-off</Card>
        </Grid>
      </Section>

      <Section title="Why it matters" tone="blue">
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

      <Section title="Our principles" tone="green">
        <Grid cols={3}>
          <Card>
            <strong>Simplicity</strong>
            <p className="mt-2 text-sm text-slate-700">Easy to use. No bloat.</p>
          </Card>
          <Card>
            <strong>Precision</strong>
            <p className="mt-2 text-sm text-slate-700">Fewer leads, higher intent.</p>
          </Card>
          <Card>
            <strong>Trust</strong>
            <p className="mt-2 text-sm text-slate-700">Clear scoring. Clear outcomes.</p>
          </Card>
          <Card>
            <strong>Local Impact</strong>
            <p className="mt-2 text-sm text-slate-700">Built for South African realities.</p>
          </Card>
          <Card>
            <strong>Speed</strong>
            <p className="mt-2 text-sm text-slate-700">Faster response, faster decisions.</p>
          </Card>
        </Grid>
      </Section>

      <FinalCTA />
      <Footer />
    </main>
  );
}

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

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl">About HeyMies</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          Intelligent automation that filters, nurtures, and scores buyers before they reach the agent.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Join HeyMies
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-xl border border-slate-300 px-7 py-3 text-sm font-semibold hover:bg-white/60"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- CTA ----------------------------- */

function FinalCTA() {
  return (
    <section className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">Ready to remove the noise?</h2>
        <p className="mt-3 text-slate-300">Join HeyMies and start working with better leads.</p>

        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Get Started
          </Link>
        </div>
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
