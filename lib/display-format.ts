export const SOUTH_AFRICA_TIME_ZONE = "Africa/Johannesburg";

export function formatDateTimeZA(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return typeof input === "string" ? input : "-";

  return date.toLocaleString("en-ZA", {
    timeZone: SOUTH_AFRICA_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateZA(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return typeof input === "string" ? input : "-";

  return date.toLocaleDateString("en-ZA", {
    timeZone: SOUTH_AFRICA_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function humanizeValue(value: string | null | undefined) {
  const normalized = (value ?? "").trim();
  if (!normalized) return "-";

  return normalized
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "hoa") return "HOA";
      if (lower === "ppra") return "PPRA";
      if (lower === "ffc") return "FFC";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function saleTypeLabel(value: string | null | undefined) {
  if (value === "rent") return "Rental";
  if (value === "sale") return "For Sale";
  return humanizeValue(value);
}

export function listingTypeLabel(value: string | null | undefined) {
  return humanizeValue(value);
}

export function statusLabel(value: string | null | undefined) {
  return humanizeValue(value);
}

export function formatPercent(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return `${numeric.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}%`;
}
