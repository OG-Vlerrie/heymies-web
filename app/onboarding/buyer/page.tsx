import { TechCard, TechHero } from "@/components/TechPage";
import Link from "next/link";

export default function BuyerOnboarding() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Buyer onboarding"
        title="Your buyer journey is almost ready."
        subtitle="Buyer onboarding is coming next. For now, we'll notify you when it opens."
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
