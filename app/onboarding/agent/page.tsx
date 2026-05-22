import { TechCard, TechHero } from "@/components/TechPage";
import AgentOnboardingForm from "./AgentOnboardingForm";

export default function AgentOnboardingPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Agent onboarding"
        title="Apply for early access."
        subtitle="We manually approve agents during the early rollout to maintain lead quality and service standards."
        graphic="score"
      />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <TechCard>
          <AgentOnboardingForm />
        </TechCard>

        <p className="mt-6 text-sm text-slate-500">
          Already applied? We'll email you once your account is approved.
        </p>
      </section>
    </main>
  );
}
