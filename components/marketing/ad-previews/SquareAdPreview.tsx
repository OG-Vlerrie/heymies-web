import { AdPreviewProps, variantClasses } from "./types";

export default function SquareAdPreview({
  headline,
  subheadline,
  cta,
  badge,
  variant = "dark",
}: AdPreviewProps) {
  const styles = variantClasses(variant);

  return (
    <article
      className={`relative aspect-square w-full max-w-[420px] overflow-hidden rounded-[28px] border border-slate-200 shadow-xl ${styles.shell}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(16,185,129,0.12)_1px,transparent_1px)] bg-[length:32px_32px]" />
      <div className="relative flex h-full flex-col justify-between p-8">
        <div className="flex items-center justify-between gap-4">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${styles.badge}`}>
            {badge}
          </span>
          <BrandMark />
        </div>

        <div>
          <div className={`mb-5 h-2 w-20 rounded-full ${styles.accent}`} />
          <h2 className="max-w-[18rem] text-4xl font-semibold leading-[1.02]">
            {headline}
          </h2>
          <p className={`mt-5 max-w-[19rem] text-base leading-7 ${styles.muted}`}>
            {subheadline}
          </p>
        </div>

        <div className={`rounded-2xl border p-4 ${styles.panel}`}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">HeyMies AI lead scoring</p>
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${styles.cta}`}>
              {cta}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl bg-white p-1" />
      <span className="text-sm font-bold">HeyMies</span>
    </div>
  );
}
