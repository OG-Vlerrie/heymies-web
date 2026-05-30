export function loadSignupDraft<T extends Record<string, unknown>>(
  key: string,
  initial: T
): T {
  if (typeof window === "undefined") return initial;

  try {
    const raw = window.localStorage.getItem(key);
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
