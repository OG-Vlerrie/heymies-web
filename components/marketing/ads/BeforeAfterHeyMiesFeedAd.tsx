type BeforeAfterHeyMiesFeedAdProps = {
  headline?: string;
  cta?: string;
  brand?: string;
};

const beforeItems = [
  "Inbox overload",
  "Missed follow-ups",
  "Unqualified enquiries",
  "Agent stressed",
];

const afterItems = [
  "Qualified buyers",
  "AI scoring",
  "Automated nurturing",
  "Priority alerts",
];

export default function BeforeAfterHeyMiesFeedAd({
  headline = "WORK SMARTER. CLOSE FASTER.",
  cta = "BOOK A DEMO",
  brand = "HeyMies",
}: BeforeAfterHeyMiesFeedAdProps) {
  return (
    <article className="relative aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[32px] bg-[#07111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[length:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_20%_60%,rgba(239,68,68,0.13),transparent_28%)]" />

      <div className="relative flex h-full flex-col p-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12 rounded-2xl bg-white p-1.5" />
            <p className="text-2xl font-bold">{brand}</p>
          </div>
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/12 px-4 py-2 text-xs font-bold uppercase text-emerald-100">
            Property tech
          </span>
        </header>

        <section className="mt-9 grid flex-1 grid-cols-2 gap-5">
          <ComparisonPanel
            eyebrow="Before HeyMies"
            tone="before"
            items={beforeItems}
            visual={<StressedAgent />}
          />
          <ComparisonPanel
            eyebrow="After HeyMies"
            tone="after"
            items={afterItems}
            visual={<DashboardSignal />}
          />
        </section>

        <footer className="border-t border-white/10 pt-6">
          <h1 className="text-center text-5xl font-black leading-[0.96] tracking-normal">
            {headline}
          </h1>
          <div className="mt-6 flex justify-center">
            <span className="rounded-2xl bg-emerald-300 px-10 py-4 text-sm font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.26)]">
              {cta}
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
}

function ComparisonPanel({
  eyebrow,
  tone,
  items,
  visual,
}: {
  eyebrow: string;
  tone: "before" | "after";
  items: string[];
  visual: React.ReactNode;
}) {
  const isAfter = tone === "after";

  return (
    <div
      className={`flex min-w-0 flex-col rounded-[28px] border p-5 ${
        isAfter
          ? "border-emerald-200/25 bg-emerald-300/10"
          : "border-red-200/20 bg-red-500/10"
      }`}
    >
      <p
        className={`text-sm font-black uppercase tracking-wide ${
          isAfter ? "text-emerald-200" : "text-red-100"
        }`}
      >
        {eyebrow}
      </p>
      <div className="mt-5">{visual}</div>
      <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-100">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className={isAfter ? "text-emerald-300" : "text-red-200"}>
              {isAfter ? "✓" : "!"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StressedAgent() {
  return (
    <div className="relative h-56 rounded-3xl bg-white/8">
      <Notice label="24 unread" className="left-3 top-4 -rotate-6" />
      <Notice label="No reply" className="right-2 top-20 rotate-6" />
      <Notice label="Cold lead" className="left-5 bottom-6 rotate-3" />
      <div className="absolute bottom-5 left-1/2 h-28 w-24 -translate-x-1/2 rounded-t-[36px] bg-slate-800" />
      <div className="absolute bottom-28 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#d7a47f]" />
      <div className="absolute bottom-[168px] left-1/2 h-7 w-20 -translate-x-1/2 rounded-t-full bg-[#2f1f18]" />
      <div className="absolute bottom-[142px] left-[calc(50%-18px)] h-2 w-2 rounded-full bg-slate-950" />
      <div className="absolute bottom-[142px] right-[calc(50%-18px)] h-2 w-2 rounded-full bg-slate-950" />
    </div>
  );
}

function Notice({ label, className }: { label: string; className: string }) {
  return (
    <div className={`absolute rounded-2xl border border-red-200/25 bg-red-500/18 px-3 py-2 text-xs font-bold text-white ${className}`}>
      {label}
    </div>
  );
}

function DashboardSignal() {
  return (
    <div className="rounded-3xl bg-white p-5 text-slate-950">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
        Lead quality
      </p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-4xl font-black">92</p>
          <p className="text-xs font-bold text-slate-500">Buyer score</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
          Priority
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[92%] rounded-full bg-emerald-500" />
      </div>
      <div className="mt-4 grid gap-2">
        <Metric label="Nurture" value="Auto" />
        <Metric label="Alert" value="Now" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}
