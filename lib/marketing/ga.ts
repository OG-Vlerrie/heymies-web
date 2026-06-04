type GaValue = string | number | boolean | null | undefined;
type GaParams = Record<string, GaValue>;
type GtagCommand = "config" | "event" | "js";

type GtagFunction = (
  command: GtagCommand,
  targetIdOrName: string | Date,
  params?: GaParams
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function pageview(url: string) {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function event(name: string, params?: GaParams) {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  const cleanParams = params ? removeEmptyValues(params) : undefined;

  if (cleanParams && Object.keys(cleanParams).length > 0) {
    window.gtag("event", name, cleanParams);
    return;
  }

  window.gtag("event", name);
}

function removeEmptyValues(params: GaParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
  ) as Record<string, string | number | boolean>;
}
