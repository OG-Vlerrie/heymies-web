import Link from "next/link";
import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const benefits = [
  ["Better matches", "HeyMies scores active listings against your budget, areas, property type, bedrooms, and bathrooms."],
  ["Less pressure", "Mia checks whether you want agent contact now or whether you are still comparing."],
  ["Useful alerts", "Saved alerts can notify you when a new listing looks like a strong fit."],
  ["Your own workspace", "Save homes, compare up to four listings, track enquiries, and keep your profile current."],
];

const journey = [
  ["Create profile", "Tell HeyMies what you are looking for and how ready you are."],
  ["Browse and compare", "Shortlist homes and see how well they fit your profile."],
  ["Enquire", "Ask about a listing with your profile context attached."],
  ["Let Mia guide it", "Mia asks the right follow-up before handing you to an agent."],
];

export default function ForBuyersPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="For buyers"
        title="Find better-matched homes without being pushed too soon."
        subtitle="HeyMies uses your buyer profile to score listings, send useful alerts, and let Mia guide the next step before an agent gets involved."
        primary={{ href: "/signup/buyer", label: "Create buyer profile" }}
        secondary={{ href: "/listings", label: "Browse listings" }}
        graphic="property"
      />

      <TechSection title="Why buyers use HeyMies" tone="alt">
        <div className="grid gap-5 md:grid-cols-4">
          {benefits.map(([title, body]) => (
            <TechCard key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="The buyer journey">
        <div className="grid gap-5 md:grid-cols-4">
          {journey.map(([title, body], index) => (
            <TechCard key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-emerald-200">
                {index + 1}
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
            </TechCard>
          ))}
        </div>
      </TechSection>

      <TechSection title="What Mia may ask" tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          <Prompt text="Are you pre-approved or paying cash?" />
          <Prompt text="Would you like to arrange a viewing?" />
          <Prompt text="Are you still comparing or should I send better matches?" />
        </div>
      </TechSection>

      <section className="tech-hero px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Create your buyer profile once.</h2>
            <p className="mt-3 text-slate-300">Then HeyMies can match, compare, and guide enquiries with more context.</p>
          </div>
          <Link href="/signup/buyer" className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
            Sign up as buyer
          </Link>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}

function Prompt({ text }: { text: string }) {
  return (
    <TechCard>
      <p className="text-sm font-semibold text-slate-600">Mia asks</p>
      <p className="mt-3 text-lg font-semibold text-slate-950">{text}</p>
    </TechCard>
  );
}
