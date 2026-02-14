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
  budget_min: string; // keep as string for inputs; cast on save
  budget_max: string;
  property_type: string;
  areas: string;
  bedrooms: string;
  bathrooms: string;

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

export default function BuyerSignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    phone: "",

    budget_min: "",
    budget_max: "",
    property_type: "",
    areas: "",
    bedrooms: "",
    bathrooms: "",

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

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  function sanitizePhone(v: string) {
    // Allow + and digits only
    return v.replace(/[^\d+]/g, "");
  }

  function parseOptionalNumber(v: string): number | null {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  function computeLeadScore() {
    let score = 0;

    const min = parseOptionalNumber(form.budget_min);
    const max = parseOptionalNumber(form.budget_max);

    // Budget provided
    if (min !== null || max !== null) score += 10;

    // Preapproval
    if (form.preapproved === "Yes") score += 30;
    if (form.preapproved === "In Progress") score += 15;

    // Timeline
    if (form.timeline === "0-3 months") score += 25;
    else if (form.timeline === "3-6 months") score += 15;
    else if (form.timeline === "6-12 months") score += 8;

    // Areas provided
    if (form.areas.trim().length >= 3) score += 10;

    // Beds/baths set
    if (parseOptionalNumber(form.bedrooms) !== null) score += 5;
    if (parseOptionalNumber(form.bathrooms) !== null) score += 5;

    // Selling first reduces urgency slightly
    if (form.selling_property === "Yes") score -= 5;

    // Clamp
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
      if (!form.property_type) return "Please select a property type.";
      // areas optional
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

  async function submit() {
    setError(null);

    // Validate all steps before submit
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });

      if (signUpError) throw new Error(signUpError.message);

      const userId = data.user?.id;
      if (!userId) throw new Error("Signup succeeded but no user returned. Please try logging in.");

      const lead_score = computeLeadScore();

      const payload = {
        user_id: userId,
        full_name: form.full_name.trim(),
        phone: sanitizePhone(form.phone),

        budget_min: parseOptionalNumber(form.budget_min),
        budget_max: parseOptionalNumber(form.budget_max),

        property_type: form.property_type,
        areas: form.areas.trim(),
        bedrooms: parseOptionalNumber(form.bedrooms),
        bathrooms: parseOptionalNumber(form.bathrooms),

        preapproved: form.preapproved,
        timeline: form.timeline,
        selling_property: form.selling_property,

        popia_consent: form.popia_consent,
        lead_score,
      };

      const { error: insertError } = await supabase.from("buyers").insert(payload);
      if (insertError) throw new Error(insertError.message);

      router.push("/dashboard"); // change if you have a buyer-specific landing page
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Buyer Signup</h1>
        <p className="mt-2 text-slate-600">Create your profile so HeyMies can qualify and match you faster.</p>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Step {step + 1} of {STEPS.length}: <span className="font-medium text-slate-800">{STEPS[step]}</span>
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

              <Field label="Property type">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.property_type}
                  onChange={(e) => setField("property_type", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                </select>
              </Field>

              <Field label="Preferred areas (comma separated)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.areas}
                  onChange={(e) => setField("areas", e.target.value)}
                  placeholder="e.g. Sandton, Bryanston, Fourways"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Bedrooms">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bedrooms}
                    onChange={(e) => setField("bedrooms", e.target.value)}
                    placeholder="e.g. 3"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Bathrooms">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bathrooms}
                    onChange={(e) => setField("bathrooms", e.target.value)}
                    placeholder="e.g. 2"
                    inputMode="numeric"
                  />
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

              {/* POPIA */}
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
          {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

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
          Already have an account? <a className="text-emerald-700 underline" href="/login">Log in</a>
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
