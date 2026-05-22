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
      <div className="mx-auto max-w-6xl">
        © {new Date().getFullYear()} HeyMies
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
          Listing signal
        </p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4">
          <div className="aspect-[16/9] rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/25 via-sky-300/15 to-white/10" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Qualified buyer match</p>
              <p className="text-sm text-slate-400">Budget, area, timing aligned</p>
            </div>
            <span className="text-2xl font-semibold text-emerald-200">94%</span>
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
              <span className="text-3xl font-semibold">RXXX</span>
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
