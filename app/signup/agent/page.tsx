"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type FormState = {
  // Auth
  email: string;
  password: string;
  confirm: string;

  // Personal
  full_name: string;
  phone: string;
  preferred_contact: string;

  // Business
  agency_name: string;
  position_title: string;
  ffc_number: string;
  years_experience: string;
  office_city: string;
  office_suburb: string;

  // Coverage + niche
  service_areas: string;
  specialties: string;

  // Ops + performance
  avg_deals_per_month: string;
  avg_commission_band: string;
  current_lead_sources: string;
  crm_tool: string;
  team_size: string;

  // Goal + consent
  onboarding_goal: string;
  popia_consent: boolean;
};

const STEPS = ["Account", "Profile", "Agency", "Performance", "Consent"];

export default function AgentSignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirm: "",

    full_name: "",
    phone: "",
    preferred_contact: "WhatsApp",

    agency_name: "",
    position_title: "",
    ffc_number: "",
    years_experience: "",
    office_city: "",
    office_suburb: "",

    service_areas: "",
    specialties: "",

    avg_deals_per_month: "",
    avg_commission_band: "",
    current_lead_sources: "",
    crm_tool: "",
    team_size: "",

    onboarding_goal: "",
    popia_consent: false,
  });

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function sanitizePhone(v: string) {
    return v.replace(/[^\d+]/g, "");
  }

  function asIntOrNull(v: string): number | null {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  function asNumOrNull(v: string): number | null {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!form.email.includes("@")) return "Enter a valid email.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== form.confirm) return "Passwords do not match.";
      return null;
    }

    if (s === 1) {
      if (form.full_name.trim().length < 2) return "Enter your full name.";
      if (sanitizePhone(form.phone).length < 9) return "Enter a valid phone number.";
      if (!form.preferred_contact) return "Select a preferred contact method.";
      return null;
    }

    if (s === 2) {
      // Agency step — require at least agency + city + areas
      if (form.agency_name.trim().length < 2) return "Enter your agency name.";
      if (form.office_city.trim().length < 2) return "Enter your office city.";
      if (form.service_areas.trim().length < 2) return "Enter your service areas (comma separated).";
      return null;
    }

    if (s === 3) {
      // Performance step — keep mostly optional but encourage structure
      if (form.crm_tool.trim().length === 0) return "Enter your CRM tool (or 'None').";
      return null;
    }

    if (s === 4) {
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
      if (!userId) throw new Error("Signup succeeded but no user returned. Try logging in.");

      const payload = {
        user_id: userId,

        full_name: form.full_name.trim(),
        phone: sanitizePhone(form.phone),
        preferred_contact: form.preferred_contact,

        agency_name: form.agency_name.trim(),
        position_title: form.position_title.trim() || null,
        ffc_number: form.ffc_number.trim() || null,
        years_experience: asIntOrNull(form.years_experience),
        office_city: form.office_city.trim() || null,
        office_suburb: form.office_suburb.trim() || null,

        service_areas: form.service_areas.trim() || null,
        specialties: form.specialties.trim() || null,

        avg_deals_per_month: asNumOrNull(form.avg_deals_per_month),
        avg_commission_band: form.avg_commission_band.trim() || null,
        current_lead_sources: form.current_lead_sources.trim() || null,
        crm_tool: form.crm_tool.trim() || null,
        team_size: asIntOrNull(form.team_size),

        onboarding_goal: form.onboarding_goal.trim() || null,
        popia_consent: form.popia_consent,
      };

      const { error: insertError } = await supabase.from("agents").insert(payload);
      if (insertError) throw new Error(insertError.message);

      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Agent Signup</h1>
        <p className="mt-2 text-slate-600">Create your HeyMies agent profile for qualified leads.</p>

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
              <h2 className="text-xl font-semibold">Account</h2>

              <Field label="Email">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@agency.com"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </Field>

                <Field label="Confirm password">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.confirm}
                    onChange={(e) => setField("confirm", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Profile</h2>

              <Field label="Full name">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="e.g. Siya Mokoena"
                />
              </Field>

              <Field label="Phone (WhatsApp-friendly)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="e.g. +27..."
                />
              </Field>

              <Field label="Preferred contact method">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.preferred_contact}
                  onChange={(e) => setField("preferred_contact", e.target.value)}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Agency</h2>

              <Field label="Agency name">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.agency_name}
                  onChange={(e) => setField("agency_name", e.target.value)}
                  placeholder="e.g. RE/MAX Sandton"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Position title (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.position_title}
                    onChange={(e) => setField("position_title", e.target.value)}
                    placeholder="Agent / Principal / Intern"
                  />
                </Field>

                <Field label="FFC number (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.ffc_number}
                    onChange={(e) => setField("ffc_number", e.target.value)}
                    placeholder="If applicable"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Years experience (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.years_experience}
                    onChange={(e) => setField("years_experience", e.target.value)}
                    placeholder="e.g. 5"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Team size (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.team_size}
                    onChange={(e) => setField("team_size", e.target.value)}
                    placeholder="e.g. 1"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Office city">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.office_city}
                    onChange={(e) => setField("office_city", e.target.value)}
                    placeholder="e.g. Johannesburg"
                  />
                </Field>

                <Field label="Office suburb (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.office_suburb}
                    onChange={(e) => setField("office_suburb", e.target.value)}
                    placeholder="e.g. Sandton"
                  />
                </Field>
              </div>

              <Field label="Service areas (comma separated)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.service_areas}
                  onChange={(e) => setField("service_areas", e.target.value)}
                  placeholder="e.g. Sandton, Bryanston, Rosebank"
                />
              </Field>

              <Field label="Specialties (comma separated)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.specialties}
                  onChange={(e) => setField("specialties", e.target.value)}
                  placeholder="e.g. Residential sales, Rentals, Luxury"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Performance & Operations</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Avg deals per month (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.avg_deals_per_month}
                    onChange={(e) => setField("avg_deals_per_month", e.target.value)}
                    placeholder="e.g. 2"
                    inputMode="decimal"
                  />
                </Field>

                <Field label="Avg commission band (optional)">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.avg_commission_band}
                    onChange={(e) => setField("avg_commission_band", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="&lt; R10k">&lt; R10k</option>
                    <option value="R10k–R25k">R10k–R25k</option>
                    <option value="R25k–R50k">R25k–R50k</option>
                    <option value="R50k–R100k">R50k–R100k</option>
                    <option value="R100k+">R100k+</option>
                  </select>
                </Field>
              </div>

              <Field label="Current lead sources (comma separated, optional)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.current_lead_sources}
                  onChange={(e) => setField("current_lead_sources", e.target.value)}
                  placeholder="e.g. Property24, referrals, social media"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="CRM tool (required)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.crm_tool}
                    onChange={(e) => setField("crm_tool", e.target.value)}
                    placeholder="e.g. PropCon, HubSpot, None"
                  />
                </Field>

                <Field label="What is your main goal? (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.onboarding_goal}
                    onChange={(e) => setField("onboarding_goal", e.target.value)}
                    placeholder="e.g. More qualified buyers"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Consent</h2>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.popia_consent}
                  onChange={(e) => setField("popia_consent", e.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  I consent to HeyMies processing my information to provide lead services and connect me with qualified
                  buyers/sellers, in line with POPIA.
                </span>
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-medium">What happens next</p>
                <ul className="mt-2 list-disc pl-5 text-slate-600">
                  <li>Your account is created.</li>
                  <li>Your agent profile is saved.</li>
                  <li>You land in your dashboard to finish setup.</li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

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
          <a className="text-emerald-700 underline" href="/login?role=agent">
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
