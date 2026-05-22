import { TechCard, TechHero } from "@/components/TechPage";
import Link from "next/link";

export default function SignupChooseRolePage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Join HeyMies"
        title="Choose your entry point."
        subtitle="Tell us how you want to use HeyMies and we'll route you into the right onboarding flow."
        graphic="pipeline"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <ChoiceCard
            title="Agent"
            desc="Get qualified buyers only. Less admin, more closing."
            href="/signup/agent"
            cta="Continue as agent"
          />
          <ChoiceCard
            title="Private Seller"
            desc="List your property and attract serious buyers, not noise."
            href="/signup/private-seller"
            cta="Continue as seller"
          />
          <ChoiceCard
            title="Buyer"
            desc="Get matched and guided until you're ready to view and buy."
            href="/signup/buyer"
            cta="Continue as buyer"
          />
        </div>

        <p className="mt-10 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-emerald-700 underline" href="/login">
            Log in
          </Link>
        </p>
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
    <TechCard>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-700">{desc}</p>
      <Link
        href={href}
        className="tech-button-primary mt-6 inline-block rounded-xl px-4 py-2 text-sm font-semibold"
      >
        {cta}
      </Link>
    </TechCard>
  );
}
