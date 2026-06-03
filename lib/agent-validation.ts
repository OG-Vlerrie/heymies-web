export function normalizeFfcNumber(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function isValidFfcNumber(value: string) {
  const normalized = normalizeFfcNumber(value);
  if (!normalized) return false;

  const compact = normalized.replace(/[\s/-]/g, "");
  const digits = compact.replace(/\D/g, "");

  return (
    normalized.length >= 5 &&
    normalized.length <= 30 &&
    /^[A-Z0-9][A-Z0-9\s/-]+$/.test(normalized) &&
    digits.length >= 4
  );
}

export function parseCommissionPercent(value: string) {
  const normalized = value.trim().replace("%", "").replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;

  return parsed;
}

export function isValidCommissionPercent(value: string) {
  const parsed = parseCommissionPercent(value);
  return parsed === null || (parsed > 0 && parsed <= 15);
}
