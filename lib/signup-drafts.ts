export function loadSignupDraft<T extends Record<string, unknown>>(
  key: string,
  initial: T
): T {
  return loadSignupDraftFromKeys([key], initial);
}

export function loadSignupDraftFromKeys<T extends Record<string, unknown>>(
  keys: string[],
  initial: T
): T {
  if (typeof window === "undefined") return initial;

  try {
    const raw = keys.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) return initial;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return initial;
    }

    return {
      ...initial,
      ...parsed,
      password: "",
      confirm: "",
    };
  } catch {
    return initial;
  }
}

export function saveSignupDraft<T extends Record<string, unknown>>(
  key: string,
  form: T,
  excludedFields = ["password", "confirm"]
) {
  if (typeof window === "undefined") return;

  try {
    const excluded = new Set(excludedFields);
    const draft = Object.fromEntries(
      Object.entries(form).filter(([field]) => !excluded.has(field))
    );

    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Draft saving should never block signup.
  }
}

export function clearSignupDraft(keys: string[]) {
  if (typeof window === "undefined") return;

  try {
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Draft cleanup should never block navigation.
  }
}

export function getSignupDraftSessionId(role: string) {
  if (typeof window === "undefined") return "server";

  const key = `heymies_signup_draft_session_${role}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(key, next);
  return next;
}
