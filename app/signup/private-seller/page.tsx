"use client";

import { useMemo, useState } from "react";
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

  // Property basics
  intent: string;
  property_type: string;
  province: string;
  city: string;
  suburb: string;
  street_address: string;

  bedrooms: string;
  bathrooms: string;
  parking: string;
  floor_size_m2: string;
  erf_size_m2: string;

  // Pricing + timing
  asking_price: string;
  price_flexibility: string;
  target_timeframe: string;

  // Status + costs
  bond_status: string;
  rates_taxes_known: boolean;
  rates_taxes_amount: string;
  levies_known: boolean;
  levies_amount: string;

  // Access + occupancy
  reason_for_selling: string;
  access_for_viewings: string;
  occupancy: string;
  available_from: string; // yyyy-mm-dd

  // Extra
  special_features: string;
  notes: string;

  // Consent
  popia_consent: boolean;
};

const STEPS = ["Account", "You", "Property", "Pricing", "Details", "Consent"];

export default function PrivateSellerSignupPage() {
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

    intent: "Sell",
    property_type: "",
    province: "",
    city: "",
    suburb: "",
    street_address: "",

    bedrooms: "",
    bathrooms: "",
    parking: "",
    floor_size_m2: "",
    erf_size_m2: "",

    asking_price: "",
    price_flexibility: "Negotiable",
    target_timeframe: "",

    bond_status: "",
    rates_taxes_known: false,
    rates_taxes_amount: "",
    levies_known: false,
    levies_amount: "",

    reason_for_selling: "",
    access_for_viewings: "",
    occupancy: "",
    available_from: "",

    special_features: "",
    notes: "",

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
      return null;
    }

    if (s === 2) {
      if (!form.property_type) return "Select a property type.";
      if (form.city.trim().length < 2) return "Enter your city.";
      if (form.suburb.trim().length < 2) return "Enter your suburb/area.";
      return null;
    }

    if (s === 3) {
      if (form.asking_price.trim().length === 0) return "Enter an asking price (or a rough estimate).";
      if (!form.target_timeframe) return "Select your target timeframe.";
      return null;
    }

    if (s === 4) {
      if (!form.bond_status) return "Select your bond status.";
      if (!form.access_for_viewings) return "Select viewing access.";
      if (!form.occupancy) return "Select occupancy.";
      return null;
    }

    if (s === 5) {
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

        intent: form.intent,
        property_type: form.property_type,
        province: form.province.trim() || null,
        city: form.city.trim() || null,
        suburb: form.suburb.trim() || null,
        street_address: form.street_address.trim() || null,

        bedrooms: asIntOrNull(form.bedrooms),
        bathrooms: asIntOrNull(form.bathrooms),
        parking: asIntOrNull(form.parking),
        floor_size_m2: asNumOrNull(form.floor_size_m2),
        erf_size_m2: asNumOrNull(form.erf_size_m2),

        asking_price: asNumOrNull(form.asking_price),
        price_flexibility: form.price_flexibility || null,
        target_timeframe: form.target_timeframe || null,

        bond_status: form.bond_status || null,
        rates_taxes_known: form.rates_taxes_known,
        rates_taxes_amount: form.rates_taxes_known ? asNumOrNull(form.rates_taxes_amount) : null,
        levies_known: form.levies_known,
        levies_amount: form.levies_known ? asNumOrNull(form.levies_amount) : null,

        reason_for_selling: form.reason_for_selling.trim() || null,
        access_for_viewings: form.access_for_viewings || null,
        occupancy: form.occupancy || null,
        available_from: form.available_from || null,

        special_features: form.special_features.trim() || null,
        notes: form.notes.trim() || null,

        popia_consent: form.popia_consent,
      };

      const { error: insertError } = await supabase.from("private_sellers").insert(payload);
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
        <h1 className="text-3xl font-semibold">Private Seller Signup</h1>
        <p className="mt-2 text-slate-600">List smarter. Get qualified buyers. Stay in control.</p>

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

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account</h2>

              <Field label="Email">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
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
              <h2 className="text-xl font-semibold">Your details</h2>

              <Field label="Full name">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                />
              </Field>

              <Field label="Phone (WhatsApp-friendly)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+27..."
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
              <h2 className="text-xl font-semibold">Property</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Intent">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.intent}
                    onChange={(e) => setField("intent", e.target.value)}
                  >
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                  </select>
                </Field>

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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Province (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.province}
                    onChange={(e) => setField("province", e.target.value)}
                  />
                </Field>

                <Field label="City">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Suburb / Area">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.suburb}
                  onChange={(e) => setField("suburb", e.target.value)}
                />
              </Field>

              <Field label="Street address (optional)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.street_address}
                  onChange={(e) => setField("street_address", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Bedrooms (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bedrooms}
                    onChange={(e) => setField("bedrooms", e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Bathrooms (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.bathrooms}
                    onChange={(e) => setField("bathrooms", e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Parking (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.parking}
                    onChange={(e) => setField("parking", e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Floor size m² (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.floor_size_m2}
                    onChange={(e) => setField("floor_size_m2", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>

                <Field label="Erf size m² (optional)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.erf_size_m2}
                    onChange={(e) => setField("erf_size_m2", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pricing</h2>

              <Field label="Asking price (ZAR)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.asking_price}
                  onChange={(e) => setField("asking_price", e.target.value)}
                  placeholder="e.g. 2500000"
                  inputMode="numeric"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Price flexibility">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.price_flexibility}
                    onChange={(e) => setField("price_flexibility", e.target.value)}
                  >
                    <option value="Firm">Firm</option>
                    <option value="Negotiable">Negotiable</option>
                    <option value="Unsure">Unsure</option>
                  </select>
                </Field>

                <Field label="Target timeframe">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.target_timeframe}
                    onChange={(e) => setField("target_timeframe", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1-3 months">1–3 months</option>
                    <option value="3-6 months">3–6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Browsing">Browsing</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Details</h2>

              <Field label="Bond status">
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.bond_status}
                  onChange={(e) => setField("bond_status", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="No bond">No bond</option>
                  <option value="Bonded">Bonded</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={form.rates_taxes_known}
                    onChange={(e) => setField("rates_taxes_known", e.target.checked)}
                  />
                  <span className="text-sm text-slate-700">I know my rates & taxes</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={form.levies_known}
                    onChange={(e) => setField("levies_known", e.target.checked)}
                  />
                  <span className="text-sm text-slate-700">I pay levies</span>
                </label>
              </div>

              {form.rates_taxes_known && (
                <Field label="Rates & taxes amount (monthly)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.rates_taxes_amount}
                    onChange={(e) => setField("rates_taxes_amount", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
              )}

              {form.levies_known && (
                <Field label="Levies amount (monthly)">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.levies_amount}
                    onChange={(e) => setField("levies_amount", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Access for viewings">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.access_for_viewings}
                    onChange={(e) => setField("access_for_viewings", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Any">Any</option>
                    <option value="By appointment">By appointment</option>
                  </select>
                </Field>

                <Field label="Occupancy">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    value={form.occupancy}
                    onChange={(e) => setField("occupancy", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Owner occupied">Owner occupied</option>
                    <option value="Tenant occupied">Tenant occupied</option>
                  </select>
                </Field>
              </div>

              <Field label="Available from (optional)">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.available_from}
                  onChange={(e) => setField("available_from", e.target.value)}
                />
              </Field>

              <Field label="Reason for selling (optional)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.reason_for_selling}
                  onChange={(e) => setField("reason_for_selling", e.target.value)}
                  placeholder="e.g. Relocating"
                />
              </Field>

              <Field label="Special features (optional)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.special_features}
                  onChange={(e) => setField("special_features", e.target.value)}
                  placeholder="e.g. Pool, solar, cottage"
                />
              </Field>

              <Field label="Notes (optional)">
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={4}
                  placeholder="Anything else that helps qualify your listing"
                />
              </Field>
            </div>
          )}

          {step === 5 && (
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
                  I consent to HeyMies processing my information to help list my property and connect me with verified
                  buyers/agents, in line with POPIA.
                </span>
              </label>
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
          <a className="text-emerald-700 underline" href="/login?role=seller">
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
