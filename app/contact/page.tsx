import {
  TechCTA,
  TechCard,
  TechFooter,
  TechHero,
  TechSection,
} from "@/components/TechPage";

export default function ContactPage() {
  return (
    <main className="tech-page">
      <TechHero
        eyebrow="Contact"
        title="Let's talk about better leads."
        subtitle="Have a question about HeyMies, pricing, or early access? Send a message and we'll get back to you."
        primary={{ href: "/signup", label: "Join HeyMies" }}
        secondary={{ href: "/pricing", label: "View pricing" }}
        graphic="contact"
      />

      <TechSection title="Get in touch" tone="alt">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <TechCard>
            <form className="grid gap-4">
              <input
                type="text"
                placeholder="Full name"
                className="tech-input w-full rounded-xl px-4 py-3 text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                className="tech-input w-full rounded-xl px-4 py-3 text-sm"
              />
              <textarea
                placeholder="Your message"
                rows={5}
                className="tech-input w-full rounded-xl px-4 py-3 text-sm"
              />
              <button
                type="submit"
                className="tech-button-primary mt-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Send message
              </button>
            </form>
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
        title="Want to see HeyMies in action?"
        body="Join early access and get started."
        href="/signup"
        label="Join HeyMies"
      />
      <TechFooter />
    </main>
  );
}
