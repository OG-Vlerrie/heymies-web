import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />
      <Steps />
      <Detail />
      <FinalCTA />
    </main>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
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
        <h1 className="text-4xl font-semibold md:text-5xl">How HeyMies works</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          A simple system designed to remove noise, qualify intent, and hand agents only buyers
          worth speaking to.
        </p>

        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- STEPS ----------------------------- */

function Steps() {
  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-4">
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
            text="Automated follow-ups keep buyers warm until they’re ready to act."
          />
          <Step
            n="4"
            title="Hand-off"
            text="Only qualified, ready buyers are sent to the agent to close."
          />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- DETAIL ----------------------------- */

function Detail() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">What the agent actually gets</h2>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li>• A buyer who has engaged multiple times</li>
              <li>• Clear intent and timeframe</li>
              <li>• Context before the first call</li>
              <li>• No chasing or guessing</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">What you don’t deal with</h2>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li>• Junk enquiries</li>
              <li>• Cold leads</li>
              <li>• Endless follow-ups</li>
              <li>• Paying for noise</li>
            </ul>
          </div>
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
        <h2 className="text-3xl font-semibold">Built for agents who value their time</h2>
        <p className="mt-3 text-slate-300">Join early and be notified when onboarding opens.</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/#join"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Join HeyMies
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- UI ----------------------------- */

function Step({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
          {n}
        </span>
        <strong>{title}</strong>
      </div>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}
