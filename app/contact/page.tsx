import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

      <Section title="Get in touch" tone="blue">
        <p className="max-w-2xl text-slate-700">
          Have a question about HeyMies, pricing, or early access? Fill in the form below and we’ll get back to you.
        </p>

        <form className="mt-8 grid max-w-2xl gap-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <textarea
            placeholder="Your message"
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="mt-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Send message
          </button>
        </form>
      </Section>

      <Section title="Other ways to reach us" tone="green">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <strong>Email</strong>
            <p className="mt-2 text-sm text-slate-700">gerhard@vertacore.co.za</p>
          </Card>
          <Card>
            <strong>Pretoria, Gauteng, South Africa</strong>
            <p className="mt-2 text-sm text-slate-700">South Africa</p>
          </Card>
        </div>
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
        <h1 className="text-4xl font-semibold md:text-5xl">Contact HeyMies</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          Let’s talk about better leads and better conversations.
        </p>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
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
        <h2 className="text-3xl font-semibold">Want to see HeyMies in action?</h2>
        <p className="mt-3 text-slate-300">Join early access and get started.</p>

        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
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
      <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}

/* ----------------------------- UI HELPERS ----------------------------- */

function Section({
  title,
  children,
  tone = "none",
}: {
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
    <section className={bg}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5">{children}</div>;
}
