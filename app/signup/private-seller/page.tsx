"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSignupDraft,
  getSignupDraftSessionId,
  loadSignupDraftFromKeys,
  saveSignupDraft,
} from "@/lib/signup-drafts";
import { supabaseBrowser } from "@/lib/supabase/browser";

type FormState = {
  email: string;
  password: string;
  confirm: string;
  full_name: string;
  phone: string;
  preferred_contact: string;
  popia_consent: boolean;
};

const STEPS = ["Account", "Contact", "Consent"] as const;
const DRAFT_KEY = "heymies_signup_draft_private_seller";
const ADD_LISTING_PATH = "/dashboard/listings/new";

const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  confirm: "",
  full_name: "",
  phone: "",
  preferred_contact: "WhatsApp",
  popia_consent: false,
};

export default function PrivateSellerSignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [draftSessionId] = useState(() => getSignupDraftSessionId("seller"));
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem(`${DRAFT_KEY}:step:${getSignupDraftSessionId("seller")}`);
    const parsed = saved ? Number(saved) : 0;
    return Number.isInteger(parsed) ? Math.max(0, Math.min(STEPS.length - 1, parsed)) : 0;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    loadSignupDraftFromKeys(
      [DRAFT_KEY, `${DRAFT_KEY}:session:${getSignupDraftSessionId("seller")}`],
      INITIAL_FORM
    )
  );

  const draftKeys = useMemo(() => {
    const keys = [DRAFT_KEY, `${DRAFT_KEY}:session:${draftSessionId}`];
    const email = form.email.trim().toLowerCase();
    if (email) keys.push(`${DRAFT_KEY}:email:${email}`);
    return keys;
  }, [draftSessionId, form.email]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    draftKeys.forEach((key) => saveSignupDraft(key, form));
  }, [draftKeys, form]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`${DRAFT_KEY}:step:${draftSessionId}`, String(step));
  }, [draftSessionId, step]);

  function sanitizePhone(value: string) {
    return value.replace(/[^\d+]/g, "");
  }

  function confirmationRedirect() {
    return `${window.location.origin}/login?next=${encodeURIComponent(ADD_LISTING_PATH)}`;
  }

  function validateStep(currentStep: number) {
    if (currentStep === 0) {
      if (!form.email.includes("@")) return "Enter a valid email.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== form.confirm) return "Passwords do not match.";
    }

    if (currentStep === 1) {
      if (form.full_name.trim().length < 2) return "Enter your full name.";
      if (sanitizePhone(form.phone).length < 9) return "Enter a valid phone number.";
      if (!form.preferred_contact) return "Choose a preferred contact method.";
    }

    if (currentStep === 2 && !form.popia_consent) {
      return "You must accept POPIA consent to continue.";
    }

    return null;
  }

  function next() {
    setError(null);
    const message = validateStep(step);
    if (message) return setError(message);
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  }

  function back() {
    setError(null);
    setStep((prev) => Math.max(0, prev - 1));
  }

  async function submit() {
    setError(null);

    for (let currentStep = 0; currentStep < STEPS.length; currentStep += 1) {
      const message = validateStep(currentStep);
      if (message) {
        setStep(currentStep);
        setError(message);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        role: "seller",
        full_name: form.full_name.trim(),
        phone: sanitizePhone(form.phone),
        preferred_contact: form.preferred_contact,
        popia_consent: form.popia_consent,
      };

      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: confirmationRedirect(),
          data: payload,
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      clearSignupDraft([...draftKeys, `${DRAFT_KEY}:step:${draftSessionId}`]);

      router.push(
        `/signup/check-email?role=seller&email=${encodeURIComponent(
          form.email.trim()
        )}&next=${encodeURIComponent(ADD_LISTING_PATH)}`
      );
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Private Seller Signup</h1>
        <p className="mt-2 text-slate-600">
          Create your seller account first. You will add property details after email confirmation.
        </p>

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
          {step === 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account</h2>

              <Field label="Email address">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@email.com"
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
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact details</h2>

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
          ) : null}

          {step === 2 ? (
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
                  I consent to HeyMies processing my information to create my seller account,
                  help me publish listings, and connect me with verified buyers or agents, in
                  line with POPIA.
                </span>
              </label>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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
          <a className="text-emerald-700 underline" href={`/login?role=seller&next=${encodeURIComponent(ADD_LISTING_PATH)}`}>
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
