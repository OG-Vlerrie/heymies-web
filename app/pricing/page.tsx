import {
  TechCTA,
  TechCard,
  TechHero,
  TechSection,
} from "@/components/TechPage";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Pricing"
        title="Pricing for cleaner property leads."
        subtitle="HeyMies pricing is being finalised during pilot validation. The model is simple: agents pay for lead intelligence, sellers pay for a guided listing flow."
        primary={{ href: "/signup/agent", label: "Join as an agent" }}
        secondary={{ href: "/contact", label: "Talk to us" }}
        graphic="pricing"
      />

      <TechSection title="Choose your model" tone="alt">
        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
        title="For Agents"
            subtitle="Lead intelligence subscription"
            price="Pilot"
            suffix="monthly"
            body="For teams that want fewer cold enquiries and more agent-ready buyer conversations."
            bullets={[
              "Buyer readiness and property fit scoring",
              "Mia follow-ups before handover",
              "Agent dashboard with summary and next action",
              "New listing match alerts for active buyers",
            ]}
            primary={{ href: "/for-agents", label: "View for agents" }}
            secondary={{ href: "/signup/agent", label: "Join" }}
          />

          <PricingCard
            title="For Private Sellers"
            subtitle="Guided listing flow"
            price="Pilot"
            suffix="per listing"
            body="For sellers who want a draft listing, cleaner buyer interest, and less manual follow-up."
            bullets={[
              "Signup details become a draft listing",
              "Photo upload and publish workflow",
              "Buyer screening and intent signals",
              "Optional agent handover later",
            ]}
            primary={{ href: "/for-private-sellers", label: "View sellers" }}
            secondary={{ href: "/signup/private-seller", label: "Join" }}
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Final numbers will be confirmed after pilot validation. Early users help shape the package.
        </p>
      </TechSection>

      <TechCTA
        title="Want pilot access?"
        body="Join with the role that fits you and we will keep pricing transparent as the pilot opens."
        href="/signup/agent"
        label="Join as an agent"
      />
    </main>
  );
}

function PricingCard({
  title,
  subtitle,
  price,
  suffix,
  body,
  bullets,
  primary,
  secondary,
}: {
  title: string;
  subtitle: string;
  price: string;
  suffix: string;
  body: string;
  bullets: string[];
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <TechCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          Pilot
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-xs font-semibold text-slate-700">Price</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {price} <span className="text-base font-medium text-slate-500">{suffix}</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primary.href}
          className="tech-button-primary inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold"
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className="tech-button-secondary inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold"
        >
          {secondary.label}
        </Link>
      </div>
    </TechCard>
  );
}
