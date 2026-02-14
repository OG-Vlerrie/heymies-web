// app/pricing/page.tsx

import Link from "next/link";

export default function PricingPage() {
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

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
            Pricing
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Simple pricing.
            <span className="block text-emerald-700">Two models.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
            Agents pay monthly. Private sellers pay once-off per property. Final pricing is being
            confirmed during pilot validation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup/agent"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Join as an Agent
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Talk to us
            </Link>
          </div>

          <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Smart. Simple. Sorted.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {/* AGENTS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">For Agents</p>
                <p className="mt-1 text-sm text-slate-600">Monthly subscription</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Placeholder
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold text-slate-700">Price</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                RXXX <span className="text-base font-medium text-slate-500">/ month</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Ongoing access to qualified leads, prioritised actions, and workflow tools.
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Lead filtering & scoring
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Smart follow-up workflows
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Action dashboard & pipeline focus
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Continuous updates
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/for-agents"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                View For Agents
              </Link>
              <Link
                href="/signup/agent"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Join
              </Link>
            </div>
          </div>

          {/* PRIVATE SELLERS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">For Private Sellers</p>
                <p className="mt-1 text-sm text-slate-600">Once-off fee (per property)</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Placeholder
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold text-slate-700">Price</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                RXXX <span className="text-base font-medium text-slate-500">once-off</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Structured tools to reduce admin and move serious buyers toward offers.
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Guided listing setup
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Buyer screening & intent signals
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Viewing & follow-up structure
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                Optional handover to an agent
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/for-private-sellers"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View For Private Sellers
              </Link>
              <Link
                href="/signup/private-seller"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Join
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Final pricing will be confirmed after pilot validation.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Want early access pricing?
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Join the waitlist and we’ll notify you as pricing goes live.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link
                href="/signup/agent"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Join as an Agent
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
