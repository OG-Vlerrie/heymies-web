// app/for-private-sellers/page.tsx

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.25) 35%, rgba(16,185,129,0.12) 60%, transparent 85%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Sell privately.
            <span className="block text-emerald-700">Without the chaos.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-700">
            HeyMies helps private sellers filter buyer noise, structure the process, and move toward
            real offers faster.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Join the waitlist
            </Link>

            <Link
              href="/contact"
              className="rounded-xl border border-slate-300 px-7 py-3 text-sm font-semibold hover:bg-white/60"
            >
              Talk to us
            </Link>
          </div>

          <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Smart. Simple. Sorted.
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Private seller tools currently in pilot.
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-blue-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            The reality of selling privately
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card
              title="Too many time-wasters"
              body="Endless enquiries. No-shows. ‘Still thinking about it.’"
            />
            <Card
              title="No structure"
              body="Photos, pricing, viewings and follow-ups all feel scattered."
            />
            <Card
              title="Unclear buyer intent"
              body="You don’t know who’s serious until weeks later."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-emerald-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            How HeyMies helps
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Step
              number="01"
              title="Structured listing setup"
              body="We guide you through presenting your property correctly from day one."
            />
            <Step
              number="02"
              title="Buyer screening"
              body="Capture buyer signals early so you focus on serious interest."
            />
            <Step
              number="03"
              title="Clear next steps"
              body="Viewings, follow-ups and offers stay organised."
            />
          </div>
        </div>
      </section>

      {/* OUTCOME */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                What you can expect
              </h2>

              <ul className="mt-8 space-y-3 text-slate-700">
                <li>• Fewer unqualified enquiries</li>
                <li>• Faster buyer conversations</li>
                <li>• Less admin overwhelm</li>
                <li>• More control over the process</li>
                <li>• Optional handover to an agent if needed</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold">Smart. Simple. Sorted.</h3>

              <p className="mt-4 text-slate-700">
                Selling privately shouldn’t mean doing everything blindly. We’re building tools that
                give you clarity and structure.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="w-full rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Join the waitlist
                </Link>

                <Link
                  href="/faq"
                  className="w-full rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-semibold hover:bg-white/60"
                >
                  Read FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold">Ready to sell with less noise?</h2>

          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-slate-700">{body}</p>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-500">{number}</p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-slate-700">{body}</p>
    </div>
  );
}
