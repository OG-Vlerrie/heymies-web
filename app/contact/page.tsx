import {
  TechCTA,
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  const contactDetails = [
    {
      label: "Email",
      value: "gerhard@vertacore.co.za",
      href: "mailto:gerhard@vertacore.co.za",
    },
    {
      label: "Phone",
      value: "+27 82 975 7678",
      href: "tel:+27829757678",
    },
    {
      label: "Address",
      value: "Pretoria, Gauteng, South Africa",
    },
  ];

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

          <div className="grid gap-4 self-start">
            <TechCard>
              <p className="tech-kicker">Direct contact</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Speak to Gerhard
              </h2>
              <div className="mt-5 divide-y divide-slate-200/80">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {detail.label}
                    </p>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="mt-1 block break-words text-sm font-semibold text-slate-950 hover:text-emerald-700"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {detail.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
