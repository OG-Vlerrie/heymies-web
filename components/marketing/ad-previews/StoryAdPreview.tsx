import { AdPreviewProps, variantClasses } from "./types";

export default function StoryAdPreview({
  headline,
  subheadline,
  cta,
  badge,
  variant = "dark",
}: AdPreviewProps) {
  const styles = variantClasses(variant);

  return (
    <article
      className={`relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[32px] border border-slate-200 shadow-xl ${styles.shell}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(16,185,129,0.12)_1px,transparent_1px)] bg-[length:34px_34px]" />
      <div className="relative flex h-full flex-col p-7">
        <div className="flex items-center justify-between gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10 rounded-xl bg-white p-1" />
          <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${styles.badge}`}>
            {badge}
          </span>
        </div>

        <div className="mt-auto">
          <div className={`mb-5 h-2 w-16 rounded-full ${styles.accent}`} />
          <h2 className="text-4xl font-semibold leading-[1.02]">{headline}</h2>
          <p className={`mt-5 text-base leading-7 ${styles.muted}`}>{subheadline}</p>
        </div>

        <div className={`mt-8 rounded-3xl border p-4 ${styles.panel}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
            Next step
          </p>
          <p className={`mt-3 rounded-2xl px-5 py-3 text-center text-sm font-bold ${styles.cta}`}>
            {cta}
          </p>
        </div>
      </div>
    </article>
  );
}
