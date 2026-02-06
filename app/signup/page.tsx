import Link from "next/link";

export default function SignupChooseRolePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.12) 40%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-4xl font-semibold md:text-5xl">Join HeyMies</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700">
            Choose how you want to use HeyMies.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ChoiceCard
              title="Agent"
              desc="Get qualified buyers only. Less admin, more closing."
              href="/onboarding/agent"
              cta="Apply as agent"
            />
            <ChoiceCard
              title="Private Seller"
              desc="List your property and attract serious buyers, not noise."
              href="/onboarding/seller"
              cta="Continue as seller"
            />
            <ChoiceCard
              title="Buyer"
              desc="Get matched and guided until you’re ready to view and buy."
              href="/onboarding/buyer"
              cta="Continue as buyer"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ChoiceCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-700">{desc}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {cta}
      </Link>
    </div>
  );
}
