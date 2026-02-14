import Link from "next/link";

export default function BuyerOnboarding() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-4xl font-semibold">Buyer</h1>
        <p className="mt-4 text-slate-700">
          Buyer onboarding is coming next. For now, we’ll notify you when it opens.
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/signup" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Back
          </Link>
          <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
