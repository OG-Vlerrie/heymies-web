type WhichBuyerWouldYouCallAdProps = {
  headline?: string;
  cta?: string;
  brand?: string;
};

const fakeBuyerItems = [
  "Just browsing",
  "No budget",
  "No pre-approval",
  "Ghosts after one message",
];

const seriousBuyerItems = [
  "High AI score",
  "Multiple property views",
  "Saved listings",
  "Ready to move",
];

export default function WhichBuyerWouldYouCallAd({
  headline = "Which Buyer Would You Rather Call?",
  cta = "Let HeyMies tell the difference.",
  brand = "HeyMies",
}: WhichBuyerWouldYouCallAdProps) {
  return (
    <article className="relative aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[32px] bg-[#07111f] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.11)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[length:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_77%_43%,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_20%_52%,rgba(248,113,113,0.12),transparent_30%)]" />

      <div className="relative flex h-full flex-col p-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12 rounded-2xl bg-white p-1.5" />
            <p className="text-2xl font-black">{brand}</p>
          </div>
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/12 px-4 py-2 text-xs font-black uppercase text-emerald-100">
            AI lead scoring
          </span>
        </header>

        <h1 className="mt-10 text-center text-5xl font-black leading-[0.96] tracking-normal">
          {headline}
        </h1>

        <section className="mt-9 grid flex-1 grid-cols-2 gap-5">
          <BuyerCard
            title="Fake Buyer"
            tone="fake"
            badge="Maybe someday"
            items={fakeBuyerItems}
          />
          <BuyerCard
            title="Serious Buyer"
            tone="serious"
            badge="Call this one"
            items={seriousBuyerItems}
          />
        </section>

        <footer className="mt-8 flex justify-center border-t border-white/10 pt-7">
          <span className="rounded-2xl bg-emerald-300 px-8 py-4 text-center text-base font-black text-slate-950 shadow-[0_18px_35px_rgba(16,185,129,0.26)]">
            {cta}
          </span>
        </footer>
      </div>
    </article>
  );
}

function BuyerCard({
  title,
  tone,
  badge,
  items,
}: {
  title: string;
  tone: "fake" | "serious";
  badge: string;
  items: string[];
}) {
  const serious = tone === "serious";

  return (
    <div
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border p-5 ${
        serious
          ? "border-emerald-200/70 bg-white text-slate-950"
          : "border-white/10 bg-white/7 text-white"
      }`}
    >
      <span
        className={`w-fit rounded-full px-3 py-1 text-[0.65rem] font-black uppercase ${
          serious ? "bg-emerald-100 text-emerald-800" : "bg-red-300/15 text-red-100"
        }`}
      >
        {badge}
      </span>
      <h2 className="mt-5 text-3xl font-black leading-none">{title}</h2>

      <div className="mt-7 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
              serious
                ? "border-slate-200 bg-slate-50"
                : "border-white/10 bg-white/8"
            }`}
          >
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                serious ? "bg-emerald-400" : "bg-red-300"
              }`}
            />
            <span
              className={`text-sm font-bold leading-5 ${
                serious ? "text-slate-800" : "text-slate-100"
              }`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-7">
        {serious ? <ScoreVisual /> : <GhostVisual />}
      </div>
    </div>
  );
}

function GhostVisual() {
  return (
    <div className="relative mx-auto h-28 w-36">
      <div className="absolute left-4 top-3 h-20 w-28 rounded-t-[48px] bg-slate-100/95" />
      <div className="absolute left-4 top-16 h-12 w-28 rounded-b-[24px] bg-slate-100/95" />
      <span className="absolute left-11 top-10 h-3 w-3 rounded-full bg-slate-950" />
      <span className="absolute right-11 top-10 h-3 w-3 rounded-full bg-slate-950" />
      <div className="absolute left-12 top-[4.1rem] h-1.5 w-12 rounded-full bg-slate-950" />
      <span className="absolute -right-1 top-0 rotate-6 rounded-2xl bg-red-300/20 px-3 py-2 text-xs font-black text-red-100">
        gone
      </span>
    </div>
  );
}

function ScoreVisual() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-black">92</p>
          <p className="text-xs font-black uppercase text-emerald-700">AI score</p>
        </div>
        <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-black text-emerald-900">
          High intent
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
      </div>
    </div>
  );
}
