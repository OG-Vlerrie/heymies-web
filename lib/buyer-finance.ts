export const BUYER_FINANCE_OPTIONS = [
  { value: "Yes", label: "Pre-approved" },
  { value: "Cash buyer", label: "Cash buyer" },
  { value: "Deposit ready", label: "Deposit ready" },
  { value: "In Progress", label: "Pre-approval in progress" },
  { value: "No", label: "Not pre-approved yet" },
] as const;

export function financeReadinessScore(value: string | null | undefined) {
  const normalized = normalizeFinanceStatus(value);

  if (normalized === "yes" || normalized.includes("cash")) return 30;
  if (normalized.includes("deposit")) return 20;
  if (normalized.includes("progress")) return 15;

  return 0;
}

export function isStrongFinanceStatus(value: string | null | undefined) {
  const normalized = normalizeFinanceStatus(value);
  return normalized === "yes" || normalized.includes("cash");
}

export function hasFinanceGap(value: string | null | undefined) {
  const normalized = normalizeFinanceStatus(value);
  return !normalized || normalized === "no" || normalized.includes("not");
}

function normalizeFinanceStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}
