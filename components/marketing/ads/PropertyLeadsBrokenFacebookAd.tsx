type PropertyLeadsBrokenFacebookAdProps = {
  headline?: string;
  body?: string;
  cta?: string;
  brand?: string;
};

const defaultBody =
  "You pay for leads. You follow up. Most never reply. HeyMies uses AI to identify serious buyers and automatically nurture the rest.";

export default function PropertyLeadsBrokenFacebookAd({
  headline = "Property Leads Are Broken",
  body = defaultBody,
  cta = "SEE THE DEMO",
  brand = "HeyMies",
}: PropertyLeadsBrokenFacebookAdProps) {
  return (
    <article className="relative aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[32px] bg-[#07111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[length:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_34%,rgba(16,185,129,0.26),transparent_34%),radial-gradient(circle_at_16%_58%,rgba(14,165,233,0.12),transparent_30%)]" />

      <div className="relative flex h-full flex-col p-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12 rounded-2xl bg-white p-1.5" />
            <p className="text-2xl font-bold">{brand}</p>
          </div>
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/12 px-4 py-2 text-xs font-bold uppercase text-emerald-100">
            AI property tech
          </span>
        </header>

        <section className="mt-10 grid flex-1 grid-cols-[0.9fr_1.1fr] gap-7">
          <AgentReviewPanel />
          <DashboardPanel />
        </section>

        <footer className="border-t border-white/10 pt-6">
          <h1 className="max-w-[27rem] text-5xl font-black leading-[0.98] tracking-normal">
            {headline}
          </h1>
          <p className="mt-5 max-w-[28rem] text-base font-medium leading-7 text-slate-300">
            {body}
          </p>
          <span className="mt-7 inline-flex rounded-2xl bg-emerald-300 px-9 py-4 text-sm font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.26)]">
            {cta}
          </span>
        </footer>
      </div>
    </article>
  );
}

function AgentReviewPanel() {
  return (
    <div className="relative min-w-0 rounded-[28px] border border-white/10 bg-white/6 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-300">
        Agent reviewing leads
      </p>
      <div className="mt-5 space-y-3">
        {["New lead", "Follow-up due", "No reply"].map((label, index) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/8 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{label}</p>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  index === 0 ? "bg-amber-300" : "bg-red-300"
                }`}
              />
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-7 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-[#d7a47f]" />
      <div className="absolute bottom-[118px] left-1/2 h-10 w-36 -translate-x-1/2 rounded-t-full bg-[#2f1f18]" />
      <div className="absolute bottom-0 left-1/2 h-32 w-48 -translate-x-1/2 rounded-t-[56px] bg-slate-800" />
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="min-w-0 rounded-[28px] border border-emerald-200/20 bg-white p-6 text-slate-950 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Qualified buyers
      </p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-black">92</p>
          <p className="text-xs font-bold text-slate-500">Buyer score</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
          High Intent
        </span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
      </div>
      <div className="mt-6 grid gap-3">
        <Metric label="AI scoring" value="Active" />
        <Metric label="Nurture" value="Auto" />
        <Metric label="Priority alert" value="Now" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
