import { AdPreviewProps, variantClasses } from "./types";

export default function CarouselSlidePreview({
  headline,
  subheadline,
  cta,
  badge,
  variant = "dark",
}: AdPreviewProps) {
  const styles = variantClasses(variant);

  return (
    <article
      className={`relative aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-[28px] border border-slate-200 shadow-xl ${styles.shell}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(16,185,129,0.12)_1px,transparent_1px)] bg-[length:30px_30px]" />
      <div className="relative flex h-full flex-col justify-between p-7">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${styles.badge}`}>
              {badge}
            </span>
            <span className="text-sm font-bold">HeyMies</span>
          </div>
          <div className={`mt-8 h-2 w-16 rounded-full ${styles.accent}`} />
          <h2 className="mt-5 text-3xl font-semibold leading-[1.04]">{headline}</h2>
          <p className={`mt-4 text-sm leading-6 ${styles.muted}`}>{subheadline}</p>
        </div>

        <div className={`rounded-2xl border p-4 ${styles.panel}`}>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[72, 88, 92].map((score) => (
              <div key={score} className="rounded-xl border border-current/10 p-2 text-center">
                <p className="text-[10px] opacity-70">Score</p>
                <p className="mt-1 text-sm font-bold">{score}</p>
              </div>
            ))}
          </div>
          <p className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${styles.cta}`}>
            {cta}
          </p>
        </div>
      </div>
    </article>
  );
}
