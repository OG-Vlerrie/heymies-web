import AgentOnboardingForm from "./AgentOnboardingForm";

export default function OnboardingPage() {
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

        <div className="relative mx-auto max-w-3xl px-4 py-20">
          <h1 className="text-4xl font-semibold md:text-5xl">Agent onboarding</h1>
          <p className="mt-4 text-lg text-slate-700">
            Tell us where you operate and how you work. We’ll approve accounts manually during early access.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <AgentOnboardingForm />
          </div>
        </div>
      </section>
    </main>
  );
}
