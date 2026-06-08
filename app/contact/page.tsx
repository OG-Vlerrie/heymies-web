import {
  TechCTA,
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Contact"
        title="Want to understand where HeyMies fits?"
        subtitle="Ask about buyer matching, seller listings, agent handover, pilot access, or how Mia can nurture leads before your team gets involved."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/pricing", label: "View pricing" }}
        graphic="contact"
      />

      <TechSection title="Get in touch" tone="alt">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <TechCard>
            <ContactForm />
          </TechCard>

          <div className="grid gap-4">
            <TechCard>
              <strong>Email</strong>
              <p className="mt-2 text-sm text-slate-700">gerhard@vertacore.co.za</p>
            </TechCard>
            <TechCard>
              <strong>Pretoria, Gauteng</strong>
              <p className="mt-2 text-sm text-slate-700">South Africa</p>
            </TechCard>
          </div>
        </div>
      </TechSection>

      <TechCTA
        title="Ready to try the flow?"
        body="Create the account type that matches your journey and HeyMies will guide the next step."
        href="/signup"
        label="Join HeyMies"
      />
      <TechFooter />
    </main>
  );
}
