type BuyerScoreStoryReelAdProps = {
  headline?: string;
  subheadline?: string;
  score?: string;
  status?: string;
  cta?: string;
  brand?: string;
  tagline?: string;
  signals?: string[];
};

const defaultSignals = [
  "Viewed listings repeatedly",
  "Saved properties",
  "Requested bond assistance",
];

export default function BuyerScoreStoryReelAd({
  headline = "THIS BUYER SCORED 92/100",
  subheadline = "Would you know which enquiries deserve your attention?",
  score = "92/100",
  status = "High Intent Buyer",
  cta = "SEE HOW HEYMIES WORKS",
  brand = "HeyMies",
  tagline = "Smart. Simple. Sorted.",
  signals = defaultSignals,
}: BuyerScoreStoryReelAdProps) {
  return (
    <article className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[34px] bg-[#06111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.11)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[length:34px_34px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.26),transparent_34%),radial-gradient(circle_at_70%_78%,rgba(14,165,233,0.14),transparent_28%)]" />

      <div className="relative flex h-full flex-col p-7">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-11 w-11 rounded-2xl bg-white p-1.5" />
            <div>
              <p className="text-lg font-bold leading-none">{brand}</p>
              <p className="mt-1 text-xs font-semibold text-slate-300">{tagline}</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/12 px-3 py-1 text-[11px] font-bold uppercase text-emerald-100">
            AI scored
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center">
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-300/12 shadow-[0_0_70px_rgba(16,185,129,0.28)]">
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-emerald-300 text-slate-950">
              <p className="text-4xl font-black leading-none">{score}</p>
              <p className="mt-2 text-[11px] font-black uppercase tracking-wide">Buyer Score</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mx-auto w-fit rounded-full border border-emerald-200/30 bg-emerald-300/12 px-4 py-2 text-sm font-black text-emerald-100">
              {status}
            </p>
            <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-normal">
              {headline}
            </h1>
            <p className="mt-5 text-base font-medium leading-7 text-slate-300">
              {subheadline}
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur">
            <ul className="space-y-3 text-sm font-semibold text-slate-100">
              {signals.map((signal) => (
                <li key={signal} className="flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-300">✓</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-5">
          <p className="rounded-2xl bg-emerald-300 px-5 py-4 text-center text-sm font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.26)]">
            {cta}
          </p>
        </footer>
      </div>
    </article>
  );
}
