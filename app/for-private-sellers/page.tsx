import {
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";
import Link from "next/link";

export default function PrivateSellersPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Private sellers"
        title="Sell privately without the chaos."
        subtitle="HeyMies helps private sellers filter buyer noise, structure the process, and move toward real offers faster."
        primary={{ href: "/signup/private-seller", label: "Join as a seller" }}
        secondary={{ href: "/how-it-works", label: "How it works" }}
        graphic="property"
      />

      <TechSection title="What you get" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          <Card
            title="Fewer time-wasters"
            body="We capture intent early so you spend time on serious buyers."
          />
          <Card
            title="A structured process"
            body="Clear steps: details, qualification, viewings, offers and follow-ups."
          />
          <Card
            title="More control"
            body="You decide who gets viewings and when, without constant back-and-forth."
          />
        </div>
      </TechSection>

      <TechSection title="How it works">
        <div className="grid gap-5 md:grid-cols-3">
          <Step
            n="1"
            title="Create your listing profile"
            body="Tell us the basics: location, price, size, and key features."
          />
          <Step
            n="2"
            title="We qualify enquiries"
            body="Buyers submit budget, timeline, and readiness so you get cleaner leads."
          />
          <Step
            n="3"
            title="Move to viewings and offers"
            body="Shortlist the right buyers faster and with less noise."
          />
        </div>

        <div className="mt-10">
          <Link
            href="/signup/private-seller"
            className="tech-button-primary inline-flex rounded-xl px-7 py-3 text-sm font-semibold"
          >
            Get started
          </Link>
        </div>
      </TechSection>

      <TechFooter />
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <TechCard>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-slate-700">{body}</p>
    </TechCard>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <TechCard>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Step {n}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-slate-700">{body}</p>
    </TechCard>
  );
}
