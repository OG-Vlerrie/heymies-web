
import Link from "next/link";

export default function ForAgentsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
    

      <Hero />
      <Pain />
      <Value />
      <HowItHelps />
      <Comparison />
      <FinalCTA />

      <Footer />
    </main>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* soft green wash */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.15) 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <h1 className="text-4xl font-semibold md:text-5xl">
          Built for agents, not portals
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          HeyMies helps you stop chasing leads and start speaking to buyers who
          are actually ready.
        </p>

        <div className="mt-8">
          <Link
            href="/#join"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Join HeyMies
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- PAIN ----------------------------- */

function Pain() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          The problem agents live with every day
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>Paying for leads that never answer.</Card>
          <Card>Racing other agents for the same enquiry.</Card>
          <Card>Spending hours qualifying buyers who aren’t ready.</Card>
          <Card>The risk always sits with you.</Card>
        </div>

        <p className="mt-6 font-semibold">
          More leads don’t solve this. Better leads do.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- VALUE ----------------------------- */

function Value() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          What HeyMies does differently
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <strong>Qualification first</strong>
            <p className="mt-2 text-sm text-slate-700">
              Leads are scored based on behaviour, engagement, and intent — not
              just a form fill.
            </p>
          </Card>

          <Card>
            <strong>Nurture without effort</strong>
            <p className="mt-2 text-sm text-slate-700">
              Automated follow-ups keep buyers warm until they’re ready to act.
            </p>
          </Card>

          <Card>
            <strong>Hand-off at the right time</strong>
            <p className="mt-2 text-sm text-slate-700">
              You only engage when there’s a real opportunity to close.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- HOW IT HELPS ----------------------------- */

function HowItHelps() {
  return (
    <section className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          What this means for you
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Benefit>Fewer calls, higher intent conversations</Benefit>
          <Benefit>Less admin, more selling</Benefit>
          <Benefit>Better use of your marketing spend</Benefit>
          <Benefit>Control over when a lead is worth your time</Benefit>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- COMPARISON ----------------------------- */

function Comparison() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          Traditional portals vs HeyMies
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <strong>Traditional portals</strong>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Pay for exposure</li>
              <li>Compete on speed</li>
              <li>Chase every enquiry</li>
              <li>Unqualified buyers</li>
            </ul>
          </Card>

          <Card>
            <strong>HeyMies</strong>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Pay for readiness</li>
              <li>Compete on relevance</li>
              <li>Speak when it matters</li>
              <li>Buyers with intent</li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CTA ----------------------------- */

function FinalCTA() {
  return (
    <section className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">
          Stop chasing. Start closing.
        </h2>
        <p className="mt-3 text-slate-300">
          Early access for agents who value their time.
        </p>

        <div className="mt-8">
          <Link
            href="/#join"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Join HeyMies
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
      <div className="mx-auto max-w-6xl">
        © {new Date().getFullYear()} HeyMies
      </div>
    </footer>
  );
}

/* ----------------------------- UI ----------------------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      {children}
    </div>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-5 font-medium">
      {children}
    </div>
  );
}
