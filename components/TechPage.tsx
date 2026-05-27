import Link from "next/link";

type Graphic = "pipeline" | "score" | "property" | "pricing" | "contact";

export function TechHero({
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
  graphic = "pipeline",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  graphic?: Graphic;
}) {
  return (
    <section className="tech-hero overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
        <div className="min-w-0">
          <p className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-[22rem] text-3xl font-semibold leading-tight text-white sm:max-w-3xl sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[22rem] text-lg leading-8 text-slate-300 sm:max-w-2xl">
            {subtitle}
          </p>

          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {primary ? (
                <Link
                  href={primary.href}
                  className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold"
                >
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/16"
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <TechGraphic type={graphic} />
      </div>
    </section>
  );
}

export function TechSection({
  title,
  children,
  tone = "plain",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "plain" | "alt";
}) {
  return (
    <section className={tone === "alt" ? "tech-section-alt" : "tech-section"}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function TechCard({ children }: { children: React.ReactNode }) {
  return <div className="tech-card rounded-2xl p-5">{children}</div>;
}

export function TechFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} HeyMies</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="font-medium hover:text-emerald-700">
            Privacy
          </Link>
          <Link href="/terms" className="font-medium hover:text-emerald-700">
            Terms
          </Link>
          <Link href="/email-preferences" className="font-medium hover:text-emerald-700">
            Email preferences
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function TechCTA({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="tech-hero px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-slate-300">{body}</p>
        </div>
        <Link href={href} className="tech-button-primary rounded-xl px-6 py-3 text-sm font-semibold">
          {label}
        </Link>
      </div>
    </section>
  );
}

export function TechGraphic({ type }: { type: Graphic }) {
  if (type === "property") return <PropertyGraphic />;
  if (type === "score") return <ScoreGraphic />;
  if (type === "pricing") return <PricingGraphic />;
  if (type === "contact") return <ContactGraphic />;
  return <PipelineGraphic />;
}

function GraphicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tech-panel min-w-0 max-w-[22rem] rounded-3xl p-5 sm:max-w-none">
      {children}
    </div>
  );
}

function PipelineGraphic() {
  return (
    <GraphicShell>
      <div className="rounded-2xl bg-[#07111f] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
          Automation flow
        </p>
        <div className="mt-5 grid gap-3">
          {["Capture", "Score", "Nurture", "Hand-off"].map((label, index) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-sm font-bold text-emerald-100">
                {index + 1}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-400" style={{ width: `${72 + index * 7}%` }} />
              </div>
              <span className="hidden w-20 text-right text-sm font-semibold sm:block">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </GraphicShell>
  );
}

function ScoreGraphic() {
  return (
    <GraphicShell>
      <div className="rounded-2xl bg-[#07111f] p-5 text-white">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              Buyer readiness
            </p>
            <p className="mt-2 text-4xl font-semibold">87</p>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
            Ready
          </span>
        </div>
        <div className="mt-6 grid grid-cols-5 items-end gap-2">
          {[38, 52, 67, 78, 92].map((height, index) => (
            <div key={height} className="rounded-xl bg-white/8 p-1">
              <div
                className="rounded-lg bg-gradient-to-t from-emerald-400 to-sky-300"
                style={{ height: `${height}px` }}
              />
              <p className="mt-2 text-center text-[10px] text-slate-400">S{index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </GraphicShell>
  );
}

function PropertyGraphic() {
  return (
    <GraphicShell>
      <div className="rounded-2xl bg-[#07111f] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
          Property signal
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/6">
          <div className="grid h-36 grid-cols-[1.1fr_0.9fr]">
            <div className="bg-gradient-to-br from-emerald-300 via-sky-300 to-slate-100 p-4 text-slate-950">
              <div className="h-full rounded-xl border border-white/60 bg-white/55 p-3 shadow-sm">
                <div className="h-3 w-20 rounded-full bg-slate-900/80" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-12 rounded-lg bg-white/70" />
                  <div className="h-12 rounded-lg bg-white/45" />
                </div>
                <div className="mt-3 h-2 w-28 rounded-full bg-slate-900/50" />
                <div className="mt-2 h-2 w-20 rounded-full bg-slate-900/25" />
              </div>
            </div>

            <div className="border-l border-white/10 p-4">
              <p className="text-sm text-slate-300">Mia's read</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-200">92%</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Strong fit based on area, budget, and intent.
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">3 Bedroom House in Sandton</p>
                <p className="text-sm text-slate-400">Draft listing ready for photos</p>
              </div>
              <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100">
                Draft
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-white/10 bg-white/6 p-2">
                <p className="text-slate-400">Beds</p>
                <p className="mt-1 font-semibold">3</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/6 p-2">
                <p className="text-slate-400">Budget</p>
                <p className="mt-1 font-semibold">Fit</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/6 p-2">
                <p className="text-slate-400">Next</p>
                <p className="mt-1 font-semibold">Publish</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GraphicShell>
  );
}

function PricingGraphic() {
  return (
    <GraphicShell>
      <div className="grid gap-3 rounded-2xl bg-[#07111f] p-5 text-white">
        {["Agents", "Private sellers"].map((label, index) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-sm text-slate-300">{label}</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold">Pilot</span>
              <span className="pb-1 text-sm text-slate-400">{index === 0 ? "/ month" : "once-off"}</span>
            </div>
          </div>
        ))}
      </div>
    </GraphicShell>
  );
}

function ContactGraphic() {
  return (
    <GraphicShell>
      <div className="rounded-2xl bg-[#07111f] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
          Response queue
        </p>
        <div className="mt-5 space-y-3">
          {["Early access", "Pricing", "Demo request"].map((label) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{label}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GraphicShell>
  );
}
