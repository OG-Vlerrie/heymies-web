export type AdPreviewVariant = "dark" | "light" | "signal" | "focus";

export type AdPreviewProps = {
  headline: string;
  subheadline: string;
  cta: string;
  badge: string;
  variant?: AdPreviewVariant;
};

export function variantClasses(variant: AdPreviewVariant = "dark") {
  if (variant === "light") {
    return {
      shell: "bg-[#f8fcfc] text-slate-950",
      accent: "bg-emerald-500",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      panel: "border-slate-200 bg-white/86 text-slate-800",
      cta: "bg-[#07111f] text-white",
      muted: "text-slate-600",
    };
  }

  if (variant === "signal") {
    return {
      shell: "bg-[#06111f] text-white",
      accent: "bg-sky-300",
      badge: "border-sky-200/35 bg-sky-300/12 text-sky-100",
      panel: "border-white/12 bg-white/8 text-slate-100",
      cta: "bg-sky-300 text-slate-950",
      muted: "text-slate-300",
    };
  }

  if (variant === "focus") {
    return {
      shell: "bg-[#06231c] text-white",
      accent: "bg-emerald-300",
      badge: "border-emerald-200/35 bg-emerald-300/12 text-emerald-100",
      panel: "border-white/12 bg-white/8 text-emerald-50",
      cta: "bg-emerald-300 text-slate-950",
      muted: "text-emerald-50/78",
    };
  }

  return {
    shell: "bg-[#07111f] text-white",
    accent: "bg-emerald-300",
    badge: "border-emerald-200/35 bg-emerald-300/12 text-emerald-100",
    panel: "border-white/12 bg-white/8 text-slate-100",
    cta: "bg-white text-slate-950",
    muted: "text-slate-300",
  };
}
