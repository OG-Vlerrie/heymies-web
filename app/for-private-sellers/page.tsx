import Link from "next/link";
import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const steps = [
  ["Tell us about the home", "Capture location, price, size, viewing access, and seller context during signup."],
  ["Get a draft listing", "HeyMies turns the signup details into a private draft listing after email confirmation."],
  ["Add photos and publish", "Review the draft, add up to 50 images, then publish when the listing is ready."],
  ["Let Mia qualify interest", "Buyer enquiries are checked before they become real conversations."],
];

export default function PrivateSellersPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="For private sellers"
        title="Start with signup. Leave with a draft listing."
        subtitle="HeyMies turns your seller signup details into a property draft, then helps filter and nurture buyer interest before you spend time on viewings."
        primary={{ href: "/signup/private-seller", label: "Create seller listing" }}
        secondary={{ href: "/how-it-works", label: "How Mia qualifies buyers" }}
        graphic="property"
      />

      <TechSection title="Built for sellers who want control" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          <SellerCard
            title="No duplicate entry"
            body="Your signup property details become the first version of your listing."
          />
          <SellerCard
            title="Draft first"
            body="Nothing goes public until you review the details, add photos, and publish."
          />
          <SellerCard
            title="Cleaner enquiries"
            body="Mia checks buyer fit and readiness so viewings start with better context."
          />
        </div>
      </TechSection>

      <TechSection title="The seller flow">
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map(([title, body], index) => (
            <TechCard key={title}>
              <p className="tech-kicker">Step {index + 1}</p>
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="What Mia protects you from" tone="alt">
        <div className="grid gap-5 md:grid-cols-2">
          <TechCard>
            <h2 className="text-xl font-semibold">Before HeyMies</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Repeated questions from buyers who are not ready.</li>
              <li>Viewing requests without finance or budget clarity.</li>
              <li>Manual follow-up after every enquiry.</li>
            </ul>
          </TechCard>
          <TechCard>
            <h2 className="text-xl font-semibold">With HeyMies</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Buyer profile, fit, and intent are checked first.</li>
              <li>Mia keeps uncertain buyers warm without pressure.</li>
              <li>Serious interest is easier to spot and act on.</li>
            </ul>
          </TechCard>
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Create the draft. Publish when ready.</h2>
            <p className="mt-3 text-slate-300">Your first listing starts from your seller signup.</p>
          </div>
          <Link href="/signup/private-seller" className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
            Start seller signup
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}

function SellerCard({ title, body }: { title: string; body: string }) {
  return (
    <TechCard>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </TechCard>
  );
}
