"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

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

type BuyerRow = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  budget_min: number | null;
  budget_max: number | null;
  property_types: string[] | null;
  areas_multi: string[] | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  preapproved: string | null;
  timeline: string | null;
  selling_property: string | null;
  popia_consent: boolean;
  lead_score: number;
};

function parseOptionalNumber(v: string): number | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function plusToInt(v: string): number | null {
  if (!v) return null;
  const n = Number(v.replace("+", ""));
  return Number.isFinite(n) ? n : null;
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buyerId, setBuyerId] = useState<string | null>(null);

  // UI state
  const [areaQuery, setAreaQuery] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    budget_min: "",
    budget_max: "",
    property_types: [] as string[],
    areas_multi: [] as string[],
    bedrooms_min: "",
    bathrooms_min: "",
    preapproved: "",
    timeline: "",
    selling_property: "",
    popia_consent: false,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function toggleArrayValue(key: "property_types" | "areas_multi", value: string) {
    setForm((prev) => {
      const set = new Set(prev[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [key]: Array.from(set) };
    });
  }

  function removeChip(key: "property_types" | "areas_multi", value: string) {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((v) => v !== value) }));
  }

  const filteredAreas = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    if (!q) return AREA_SUGGESTIONS.slice(0, 10);
    return AREA_SUGGESTIONS.filter((a) => a.toLowerCase().includes(q)).slice(0, 10);
  }, [areaQuery]);

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

    if (form.areas_multi.length > 0) score += 10;
    if (form.property_types.length > 0) score += 5;

    if (plusToInt(form.bedrooms_min) !== null) score += 5;
    if (plusToInt(form.bathrooms_min) !== null) score += 5;

    if (form.selling_property === "Yes") score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      setLoading(true);

      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;

        if (!user) {
          router.push("/login?next=/dashboard/buyer/profile");
          return;
        }

        const { data: buyerRow, error: buyerErr } = await supabase
          .from("buyers")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (buyerErr) throw new Error(buyerErr.message);

        // If you used the auth trigger, buyerRow should exist.
        // If it doesn't, user may have signed up before trigger existed -> create minimal row now.
        let row = buyerRow as BuyerRow | null;

        if (!row) {
          const { data: created, error: createErr } = await supabase
            .from("buyers")
            .insert({
              user_id: user.id,
              full_name: "",
              phone: "",
              popia_consent: false,
              lead_score: 0,
            })
            .select("*")
            .single();

          if (createErr) throw new Error(createErr.message);
          row = created as BuyerRow;
        }

        if (cancelled) return;

        setBuyerId(row.id);

        setForm({
          full_name: row.full_name ?? "",
          phone: row.phone ?? "",
          budget_min: row.budget_min?.toString() ?? "",
          budget_max: row.budget_max?.toString() ?? "",
          property_types: row.property_types ?? [],
          areas_multi: row.areas_multi ?? [],
          bedrooms_min: row.bedrooms_min ? `${row.bedrooms_min}+` : "",
          bathrooms_min: row.bathrooms_min ? `${row.bathrooms_min}+` : "",
          preapproved: row.preapproved ?? "",
          timeline: row.timeline ?? "",
          selling_property: row.selling_property ?? "",
          popia_consent: row.popia_consent ?? false,
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function save() {
    setError(null);

    if (!buyerId) return setError("Buyer profile not loaded.");
    if (form.full_name.trim().length < 2) return setError("Please enter your full name.");
    if (form.phone.trim().length < 7) return setError("Please enter a phone number.");
    if (!form.popia_consent) return setError("You must accept POPIA consent to continue.");
    if (form.property_types.length === 0) return setError("Please select at least one property type.");

    const min = parseOptionalNumber(form.budget_min);
    const max = parseOptionalNumber(form.budget_max);
    if (min !== null && max !== null && min > max) return setError("Budget Min cannot be higher than Budget Max.");

    setSaving(true);

    try {
      const lead_score = computeLeadScore();

      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        budget_min: min,
        budget_max: max,
        property_types: form.property_types,
        areas_multi: form.areas_multi,
        bedrooms_min: plusToInt(form.bedrooms_min),
        bathrooms_min: plusToInt(form.bathrooms_min),
        preapproved: form.preapproved || null,
        timeline: form.timeline || null,
        selling_property: form.selling_property || null,
        popia_consent: form.popia_consent,
        lead_score,
      };

      const { error: upErr } = await supabase.from("buyers").update(payload).eq("id", buyerId);
      if (upErr) throw new Error(upErr.message);

      router.push("/dashboard/buyer");
    } catch (e: any) {
      setError(e?.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Complete your buyer profile</h1>
        <p className="mt-2 text-slate-600">This helps HeyMies match you faster.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
        ) : (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <Field label="Full name">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
              />
            </Field>

            <Field label="Phone">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Budget min (ZAR)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.budget_min}
                  onChange={(e) => setField("budget_min", e.target.value)}
                  inputMode="numeric"
                />
              </Field>

              <Field label="Budget max (ZAR)">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.budget_max}
                  onChange={(e) => setField("budget_max", e.target.value)}
                  inputMode="numeric"
                />
              </Field>
            </div>

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

            <div>
              <div className="mb-2 block text-sm font-medium text-slate-700">
                Preferred areas (search and add)
              </div>

              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                value={areaQuery}
                onChange={(e) => setAreaQuery(e.target.value)}
                placeholder="Search areas…"
              />

              <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">
                <div className="flex flex-wrap gap-2">
                  {filteredAreas.map((a) => {
                    const active = form.areas_multi.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleArrayValue("areas_multi", a)}
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
                <p className="mt-2 text-xs text-slate-500">Click to add/remove areas.</p>
              </div>

              {form.areas_multi.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.areas_multi.map((a) => (
                    <Chip key={a} text={a} onRemove={() => removeChip("areas_multi", a)} />
                  ))}
                </div>
              )}
            </div>

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

              {form.preapproved !== "Yes" && (
                <a
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                  href="https://www.ooba.co.za/home-loans/pre-approval/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Do pre-approval
                </a>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
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

              <Field label="Need to sell first?">
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
            </div>

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
              <p className="mt-2 text-slate-600">Higher score = faster matching.</p>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        )}
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