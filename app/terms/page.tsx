import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const terms = [
  {
    title: "Alpha Product",
    body: "HeyMies is currently an early product. Features, scoring, matching, dashboards, emails, and availability may change as testing continues.",
  },
  {
    title: "Property Information",
    body: "Listings, prices, descriptions, availability, and property details should be verified before a buyer or seller makes a decision. HeyMies helps organize information but does not replace professional advice.",
  },
  {
    title: "Mia And Matching",
    body: "Mia uses profile information, listing details, and enquiry signals to estimate fit and readiness. Scores and suggested next actions are decision-support signals, not guarantees.",
  },
  {
    title: "User Responsibilities",
    body: "Users should provide accurate information, use the service lawfully, and avoid submitting information they are not allowed to share.",
  },
  {
    title: "Agent And Seller Follow-Up",
    body: "When an enquiry appears ready, HeyMies may share buyer context with the relevant agent or seller so they can follow up on the property conversation.",
  },
  {
    title: "Changes",
    body: "These terms may be updated as HeyMies moves from alpha testing toward wider availability.",
  },
];

export default function TermsPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Terms"
        title="Clear rules for an early HeyMies test."
        subtitle="These alpha terms set expectations for buyers, private sellers, agents, and testers while the platform is still being refined."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/privacy", label: "Read privacy notice" }}
        graphic="score"
      />

      <TechSection title="Terms Of Use">
        <div className="grid gap-5 md:grid-cols-2">
          {terms.map((item) => (
            <TechCard key={item.title}>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.body}</p>
            </TechCard>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-slate-600">
          This page is an alpha-stage operating notice and should be reviewed before broad
          public launch.
        </p>
      </TechSection>

      <TechFooter />
    </main>
  );
}
