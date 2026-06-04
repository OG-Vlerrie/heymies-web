type MetaPixelValue = string | number | boolean | null | undefined;
type MetaPixelParams = Record<string, MetaPixelValue>;
type MetaPixelCommand = "track" | "init";

type MetaPixelFunction = (
  command: MetaPixelCommand,
  eventNameOrPixelId: string,
  params?: MetaPixelParams
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

export function pageview() {
  track("PageView");
}

export function track(eventName: string, params?: MetaPixelParams) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;
  if (!window.fbq) return;

  const cleanParams = params ? removeEmptyValues(params) : undefined;

  if (cleanParams && Object.keys(cleanParams).length > 0) {
    window.fbq("track", eventName, cleanParams);
    return;
  }

  window.fbq("track", eventName);
}

function removeEmptyValues(params: MetaPixelParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
  ) as Record<string, string | number | boolean>;
}
