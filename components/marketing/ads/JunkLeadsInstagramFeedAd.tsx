type JunkLeadsInstagramFeedAdProps = {
  headline?: string;
  subheadline?: string;
  cta?: string;
  footer?: string;
  tagline?: string;
};

export default function JunkLeadsInstagramFeedAd({
  headline = "STOP WASTING TIME ON JUNK LEADS",
  subheadline = "Let AI identify serious buyers before you spend hours following up.",
  cta = "BOOK A DEMO",
  footer = "HeyMies",
  tagline = "Smart. Simple. Sorted.",
}: JunkLeadsInstagramFeedAdProps) {
  return (
    <article className="relative aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[32px] bg-[#07111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(16,185,129,0.13)_1px,transparent_1px)] bg-[length:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_18%_72%,rgba(14,165,233,0.16),transparent_30%)]" />

      <div className="relative flex h-full flex-col p-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12 rounded-2xl bg-white p-1.5" />
            <div>
              <p className="text-lg font-bold leading-none">HeyMies</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                AI lead scoring
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/12 px-4 py-2 text-xs font-bold uppercase text-emerald-100">
            Estate agents
          </span>
        </header>

        <section className="mt-10 grid flex-1 grid-cols-[0.92fr_1.08fr] gap-8">
          <div className="flex min-w-0 flex-col justify-end pb-8">
            <AgentScene />
          </div>

          <div className="flex min-w-0 flex-col justify-end gap-6 pb-8">
            <DashboardCard />
            <div className="rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                Buyer signal
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-normal">
                {headline}
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-slate-300">
                {subheadline}
              </p>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-xl font-bold">{footer}</p>
            <p className="mt-1 text-sm font-medium text-slate-300">{tagline}</p>
          </div>
          <span className="rounded-2xl bg-emerald-300 px-8 py-4 text-sm font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.28)]">
            {cta}
          </span>
        </footer>
      </div>
    </article>
  );
}

function AgentScene() {
  return (
    <div className="relative h-[430px] rounded-[28px] border border-white/10 bg-white/6 p-5">
      <Notification label="New enquiry" value="12 unread" className="left-4 top-5 rotate-[-5deg]" />
      <Notification label="Buyer replied" value="maybe later" className="right-3 top-24 rotate-[5deg]" />
      <Notification label="Viewing request" value="no answer" className="left-2 top-48 rotate-[3deg]" />
      <Notification label="Portal lead" value="cold" className="right-5 bottom-16 rotate-[-4deg]" />

      <div className="absolute bottom-8 left-1/2 h-56 w-40 -translate-x-1/2">
        <div className="mx-auto h-24 w-24 rounded-full bg-[#d7a47f]" />
        <div className="absolute left-1/2 top-16 h-10 w-28 -translate-x-1/2 rounded-b-full bg-[#2f1f18]" />
        <div className="absolute left-[42px] top-10 h-3 w-3 rounded-full bg-slate-950" />
        <div className="absolute right-[42px] top-10 h-3 w-3 rounded-full bg-slate-950" />
        <div className="absolute left-1/2 top-[62px] h-2 w-10 -translate-x-1/2 rounded-full bg-[#7f1d1d]" />
        <div className="absolute bottom-0 left-1/2 h-36 w-40 -translate-x-1/2 rounded-t-[44px] bg-slate-800" />
        <div className="absolute bottom-0 left-1/2 h-32 w-20 -translate-x-1/2 rounded-t-[34px] bg-white" />
        <div className="absolute bottom-0 left-1/2 h-28 w-4 -translate-x-1/2 bg-emerald-500" />
      </div>
    </div>
  );
}

function Notification({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`absolute z-10 rounded-2xl border border-red-200/25 bg-red-500/14 p-3 shadow-lg ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-red-100">{label}</p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function DashboardCard() {
  return (
    <div className="rounded-[28px] border border-emerald-200/20 bg-white p-6 text-slate-950 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            HeyMies dashboard
          </p>
          <h2 className="mt-3 text-2xl font-black">Buyer Score: 92/100</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
          High Intent
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
      </div>

      <div className="mt-6 grid gap-3">
        <Metric label="Status" value="High Intent" />
        <Metric label="Viewed Listing" value="5 times" />
        <Metric label="Saved Properties" value="3" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
