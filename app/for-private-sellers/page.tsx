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
              href="/signup/private-seller"
              className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Join as a Private Seller
            </Link>

            <Link
              href="/how-it-works"
              className="rounded-xl border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              How it works
            </Link>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Smart. Simple. Sorted.
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold md:text-3xl">What you get</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card
            title="Fewer time-wasters"
            body="We capture intent early so you spend time on serious buyers."
          />
          <Card
            title="A structured process"
            body="Clear steps: details, qualification, viewings, offers and follow-ups."
          />
          <Card
            title="More control"
            body="You decide who gets viewings and when, without constant back-and-forth."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Step n="1" title="Create your listing profile" body="Tell us the basics: location, price, size, and key features." />
            <Step n="2" title="We qualify enquiries" body="Buyers submit budget, timeline, and readiness so you get cleaner leads." />
            <Step n="3" title="You move to viewings/offers" body="Shortlist and progress the right buyers—faster and with less noise." />
          </div>

          <div className="mt-10">
            <Link
              href="/signup/private-seller"
              className="inline-flex rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-slate-700">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Step {n}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-slate-700">{body}</p>
    </div>
  );
}
