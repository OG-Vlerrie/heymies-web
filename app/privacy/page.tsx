import { TechCard, TechFooter, TechHero, TechSection } from "@/components/TechPage";

const sections = [
  {
    title: "What HeyMies Collects",
    body: "HeyMies collects the information needed to help buyers, private sellers, and agents move through the property process. This can include contact details, buyer preferences, property details, enquiry messages, saved listings, match alerts, and email preference choices.",
  },
  {
    title: "How We Use It",
    body: "We use this information to create profiles, match buyers to listings, qualify enquiries, send relevant follow-ups from Mia, route agent-ready leads, manage listings, and keep operational records for support, safety, and quality control.",
  },
  {
    title: "Who May Receive It",
    body: "When a buyer asks to be connected or Mia marks an enquiry as ready, relevant contact and enquiry context may be shared with the responsible agent or seller. We do not sell personal information to unrelated third parties.",
  },
  {
    title: "Email Controls",
    body: "Users can manage marketing, Mia nurture, and match alert emails from the email preferences page or unsubscribe links included in HeyMies emails.",
  },
  {
    title: "POPIA And User Rights",
    body: "HeyMies is being built for South African property workflows and should be operated in line with POPIA. Users may ask to access, correct, or delete their personal information by contacting HeyMies support.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Privacy"
        title="Your property journey should feel useful, not exposed."
        subtitle="This privacy notice explains what HeyMies collects, why we collect it, and how users can control email communication."
        primary={{ href: "/email-preferences", label: "Manage email preferences" }}
        secondary={{ href: "/contact", label: "Contact HeyMies" }}
        graphic="contact"
      />

      <TechSection title="Privacy Notice">
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <TechCard key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{section.body}</p>
            </TechCard>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-slate-600">
          This page is a practical alpha-stage privacy notice and should be reviewed before
          broad public launch.
        </p>
      </TechSection>

      <TechFooter />
    </main>
  );
}
