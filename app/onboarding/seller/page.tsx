import { TechCard, TechHero } from "@/components/TechPage";
import Link from "next/link";

export default function SellerOnboarding() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Seller onboarding"
        title="Private seller onboarding is opening soon."
        subtitle="For now, we'll onboard sellers manually and keep the process structured."
        graphic="property"
      />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <TechCard>
          <div className="flex gap-3">
            <Link href="/signup" className="tech-button-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Back
            </Link>
            <Link href="/" className="tech-button-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Home
            </Link>
          </div>
        </TechCard>
      </section>
    </main>
  );
}
