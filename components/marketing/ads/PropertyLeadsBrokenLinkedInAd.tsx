type PropertyLeadsBrokenLinkedInAdProps = {
  headline?: string;
  body?: string;
  cta?: string;
  brand?: string;
};

const defaultBody =
  "You pay for leads. You follow up. Most never reply. HeyMies uses AI to identify serious buyers and automatically nurture the rest.";

export default function PropertyLeadsBrokenLinkedInAd({
  headline = "Property Leads Are Broken",
  body = defaultBody,
  cta = "SEE THE DEMO",
  brand = "HeyMies",
}: PropertyLeadsBrokenLinkedInAdProps) {
  return (
    <article className="relative aspect-[1200/628] w-full max-w-[760px] overflow-hidden rounded-[24px] bg-[#07111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.16)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[length:36px_36px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(16,185,129,0.28),transparent_34%)]" />

      <div className="relative grid h-full grid-cols-[0.98fr_1.02fr] gap-5 p-8">
        <section className="flex flex-col">
          <header className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-10 w-10 rounded-2xl bg-white p-1.5" />
            <p className="text-xl font-black">{brand}</p>
          </header>

          <div className="mt-12">
            <h1 className="max-w-[22rem] text-[2.65rem] font-black leading-[0.98] tracking-normal">
              {headline}
            </h1>
            <p className="mt-7 max-w-[22rem] text-lg font-medium leading-8 text-slate-300">
              {body}
            </p>
          </div>

          <span className="mt-auto inline-flex w-fit rounded-2xl bg-emerald-300 px-9 py-4 text-sm font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.24)]">
            {cta}
          </span>
        </section>

        <section className="grid grid-cols-[0.86fr_1.05fr] items-end gap-4 pt-14">
          <AgentPanel />
          <DashboardPanel />
        </section>

        <span className="absolute right-9 top-9 rounded-full border border-emerald-100/40 bg-emerald-300/18 px-7 py-2 text-xs font-black uppercase text-emerald-100">
          B2B SaaS
        </span>
      </div>
    </article>
  );
}

function AgentPanel() {
  return (
    <div className="relative h-[22.7rem] min-w-0 rounded-[26px] bg-white p-5 text-slate-950 shadow-2xl">
      <p className="text-[0.7rem] font-black uppercase tracking-wide text-slate-500">
        Agent reviewing leads
      </p>
      <div className="mt-5 grid gap-3">
        <LeadCard label="New lead" tone="warm" />
        <LeadCard label="No reply" tone="risk" />
      </div>
      <div className="absolute bottom-7 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#d7a47f]" />
      <div className="absolute bottom-[98px] left-1/2 h-10 w-28 -translate-x-1/2 rounded-t-full bg-[#2f1f18]" />
      <div className="absolute bottom-0 left-1/2 h-24 w-40 -translate-x-1/2 rounded-t-[48px] bg-slate-800" />
    </div>
  );
}

function LeadCard({ label, tone }: { label: string; tone: "warm" | "risk" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          tone === "warm" ? "bg-amber-300" : "bg-red-300"
        }`}
      />
      <span className="text-sm font-black">{label}</span>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="min-w-0 rounded-[26px] border border-emerald-200/70 bg-white p-6 text-slate-950 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        AI Dashboard
      </p>
      <p className="mt-6 text-2xl font-black">Qualified buyers</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-5xl font-black">92</p>
        <span className="rounded-full bg-emerald-100 px-5 py-2 text-sm font-black text-emerald-800">
          Ready
        </span>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
      </div>
      <div className="mt-4 grid gap-2.5">
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
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className="text-xs font-black text-slate-950">{value}</span>
    </div>
  );
}
