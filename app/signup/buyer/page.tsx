"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FormState = {
  // Step 1
  full_name: string;
  phone: string;

  // Step 2
  budget_min: string;
  budget_max: string;
  property_types: string[]; // MULTI
  areas: string[]; // MULTI
  bedrooms_min: string; // "1+" etc
  bathrooms_min: string; // "1+" etc

  // Step 3
  preapproved: string;
  timeline: string;
  selling_property: string;
  popia_consent: boolean;

  // Auth
  email: string;
  password: string;
  confirm: string;
};

const STEPS = ["Details", "Property", "Qualification"];

const PROPERTY_TYPE_OPTIONS = ["House", "Apartment", "Townhouse", "Land"];

const AREA_SUGGESTIONS = [
  "Sandton",
  "Bryanston",
  "Fourways",
  "Rosebank",
  "Melrose",
  "Randburg",
  "Midrand",
  "Centurion",
  "Pretoria East",
  "Bedfordview",
  "Edenvale",
  "Kempton Park",
];

const PLUS_OPTIONS = ["", "1+", "2+", "3+", "4+", "5+", "6+"];

export default function BuyerSignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Areas search input (UI-only)
  const [areaQuery, setAreaQuery] = useState("");

  const [form, setForm] = useState<FormState>({
    full_name: "",
    phone: "",

    budget_min: "",
    budget_max: "",
    property_types: [],
    areas: [],
    bedrooms_min: "",
    bathrooms_min: "",

    preapproved: "",
    timeline: "",
    selling_property: "",
    popia_consent: false,

    email: "",
    password: "",
    confirm: "",
  });

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  function sanitizePhone(v: string) {
    return v.replace(/[^\d+]/g, "");
  }

  function parseOptionalNumber(v: string): number | null {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  function parsePlusToNumber(v: string): number | null {
    if (!v) return null;
    const n = Number(v.replace("+", ""));
    return Number.isFinite(n) ? n : null;
  }

  function computeLeadScore() {
    let score = 0;

    const min = parseOptionalNumber(form.budget_min);
    const max = parseOptionalNumber(form.budget_max);

    if (min !== null || max !== null) score += 10;

    if (form.preapproved === "Yes") score += 30;
    if (form.preapproved === "In Progress") score += 15;

    if (form.timeline === "0-3 months") score += 25;
    else if (form.timeline === "3-6 months") score += 15;
    else if (form.timeline === "6-12 months") score += 8;

    if (form.areas.length > 0) score += 10;
    if (form.property_types.length > 0) score += 5;

    if (parsePlusToNumber(form.bedrooms_min) !== null) score += 5;
    if (parsePlusToNumber(form.bathrooms_min) !== null) score += 5;

    if (form.selling_property === "Yes") score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (form.full_name.trim().length < 2) return "Please enter your full name.";
      const phone = sanitizePhone(form.phone);
      if (phone.length < 9) return "Please enter a valid phone number.";
      if (!form.email.includes("@")) return "Please enter a valid email address.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== form.confirm) return "Passwords do not match.";
      return null;
    }

    if (s === 1) {
      const min = parseOptionalNumber(form.budget_min);
      const max = parseOptionalNumber(form.budget_max);
      if (min !== null && max !== null && min > max) return "Budget Min cannot be higher than Budget Max.";
      if (form.property_types.length === 0) return "Please select at least one property type.";
      return null;
    }

    if (s === 2) {
      if (!form.preapproved) return "Please select your bond status.";
      if (!form.timeline) return "Please select your buying timeline.";
      if (!form.selling_property) return "Please tell us if you need to sell first.";
      if (!form.popia_consent) return "You must accept POPIA consent to continue.";
      return null;
    }

    return null;
  }

  function next() {
    setError(null);
    const msg = validateStep(step);
    if (msg) return setError(msg);
    setStep((v) => Math.min(STEPS.length - 1, v + 1));
  }

  function back() {
    setError(null);
    setStep((v) => Math.max(0, v - 1));
  }

  function toggleArrayValue(key: "property_types" | "areas", value: string) {
    setForm((prev) => {
      const set = new Set(prev[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [key]: Array.from(set) };
    });
  }

  function removeChip(key: "property_types" | "areas", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
  }

  const filteredAreas = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    if (!q) return AREA_SUGGESTIONS.slice(0, 8);
    return AREA_SUGGESTIONS.filter((a) => a.toLowerCase().includes(q)).slice(0, 8);
  }, [areaQuery]);

  async function submit() {
    setError(null);

    // Validate all steps
    for (let s = 0; s < STEPS.length; s++) {
      const msg = validateStep(s);
      if (msg) {
        setStep(s);
        setError(msg);
        return;
      }
    }

    setLoading(true);

    try {
      // Confirm Email is ON → user will NOT be logged in yet → don't insert into buyers here.
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          // Optional: store data so you can use it later if you want
          data: {
            full_name: form.full_name.trim(),
            phone: sanitizePhone(form.phone),
            lead_score_estimate: computeLeadScore(),
            property_types: form.property_types,
            areas: form.areas,
            bedrooms_min: parsePlusToNumber(form.bedrooms_min),
            bathrooms_min: parsePlusToNumber(form.bathrooms_min),
            preapproved: form.preapproved,
            timeline: form.timeline,
            selling_property: form.selling_property,
            popia_consent: form.popia_consent,
            budget_min: parseOptionalNumber(form.budget_min),
            budget_max: parseOptionalNumber(form.budget_max),
          },
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // Send them to the generic confirm screen
      router.push("/signup/check-email?role=buyer");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const PREAPPROVAL_URL = "https://www.ooba.co.za/home-loans/pre-approval/";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Buyer Signup</h1>
        <p className="mt-2 text-slate-600">
          Create your profile so HeyMies can qualify and match you faster.
        </p>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Step {step + 1} of {STEPS.length}:{" "}
              <span className="font-medium text-slate-800">{STEPS[step]}</span>
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Details</h2>

              <Field label="Full name">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </Field>

              <Field label="Phone number">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="e.g. +27..."
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@email.com"
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </Field>
              </div>

              <Field label="Confirm password">
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.confirm}
                  onChange={(e) => setField("confirm", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">What are you looking for?</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Budget min (ZAR)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.budget_min}
                    onChange={(e) => setField("budget_min", e.target.value)}
                    placeholder="e.g. 1500000"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Budget max (ZAR)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.budget_max}
                    onChange={(e) => setField("budget_max", e.target.value)}
                    placeholder="e.g. 2500000"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              {/* Property Types (multi-select chips) */}
              <div>
                <div className="mb-2 block text-sm font-medium text-slate-700">
                  Property type (select all that apply)
                </div>

                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPE_OPTIONS.map((t) => {
                    const active = form.property_types.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleArrayValue("property_types", t)}
                        className={[
                          "rounded-full border px-4 py-2 text-sm",
                          active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                {form.property_types.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.property_types.map((t) => (
                      <Chip key={t} text={t} onRemove={() => removeChip("property_types", t)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Areas search + multi-select */}
              <div>
                <div className="mb-2 block text-sm font-medium text-slate-700">
                  Preferred areas (search and add)
                </div>

                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={areaQuery}
                  onChange={(e) => setAreaQuery(e.target.value)}
                  placeholder="Search areas… e.g. Sandton"
                />

                <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex flex-wrap gap-2">
                    {filteredAreas.map((a) => {
                      const active = form.areas.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleArrayValue("areas", a)}
                          className={[
                            "rounded-full border px-3 py-1.5 text-sm",
                            active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Tip: start typing to filter, then click to add.
                  </p>
                </div>

                {form.areas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.areas.map((a) => (
                      <Chip key={a} text={a} onRemove={() => removeChip("areas", a)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Beds/Baths dropdowns */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Bedrooms (minimum)">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bedrooms_min}
                    onChange={(e) => setField("bedrooms_min", e.target.value)}
                  >
                    {PLUS_OPTIONS.map((o) => (
                      <option key={o || "none"} value={o}>
                        {o ? o : "Select…"}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Bathrooms (minimum)">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bathrooms_min}
                    onChange={(e) => setField("bathrooms_min", e.target.value)}
                  >
                    {PLUS_OPTIONS.map((o) => (
                      <option key={o || "none"} value={o}>
                        {o ? o : "Select…"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Qualification</h2>

              <Field label="Bond / pre-approval status">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.preapproved}
                  onChange={(e) => setField("preapproved", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="Yes">Pre-approved</option>
                  <option value="In Progress">In progress</option>
                  <option value="No">Not pre-approved</option>
                </select>

                <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <span className="text-slate-700">Need pre-approval?</span>
                  <a
                    href={PREAPPROVAL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Do pre-approval
                  </a>
                </div>
              </Field>

              <Field label="Buying timeline">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.timeline}
                  onChange={(e) => setField("timeline", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="0-3 months">0–3 months</option>
                  <option value="3-6 months">3–6 months</option>
                  <option value="6-12 months">6–12 months</option>
                  <option value="Browsing">Just browsing</option>
                </select>
              </Field>

              <Field label="Do you need to sell a property first?">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.selling_property}
                  onChange={(e) => setField("selling_property", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Field>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.popia_consent}
                  onChange={(e) => setField("popia_consent", e.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  I consent to HeyMies processing my information to qualify my request and connect me with real estate
                  professionals, in line with POPIA.
                </span>
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Estimated lead score</span>
                  <span className="font-semibold">{computeLeadScore()}/100</span>
                </div>
                <p className="mt-2 text-slate-600">
                  This helps prioritize serious buyers for faster matching.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <a className="text-emerald-700 underline" href="/login">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Chip({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
      {text}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs hover:bg-slate-100"
        aria-label={`Remove ${text}`}
      >
        ×
      </button>
    </span>
  );
}