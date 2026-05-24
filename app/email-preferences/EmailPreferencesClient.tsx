"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Preferences = {
  email: string | null;
  marketing_emails: boolean;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

export default function EmailPreferencesClient({
  token,
  status,
  topic,
}: {
  token: string;
  status: string;
  topic: string;
}) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/email-preferences?token=${encodeURIComponent(token)}`);
      const data = await res.json();

      if (cancelled) return;

      if (!res.ok) {
        setError(data?.error ?? "Could not load email preferences.");
      } else {
        setPreferences(data.preferences);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (status === "unsubscribed") {
      setMessage(
        topic && topic !== "all"
          ? "You have been unsubscribed from that email type."
          : "You have been unsubscribed from HeyMies emails."
      );
    }

    if (status === "invalid") setError("This preference link is missing a valid token.");
    if (status === "error") setError("We could not update your preferences. Please try again.");
  }, [status, topic]);

  async function save(next: Preferences) {
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch(`/api/email-preferences?token=${encodeURIComponent(token)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data?.error ?? "Could not save preferences.");
    } else {
      setPreferences(data.preferences);
      setMessage("Email preferences saved.");
    }

    setSaving(false);
  }

  function update(key: keyof Pick<Preferences, "marketing_emails" | "nurture_emails" | "match_alert_emails">) {
    if (!preferences) return;
    save({ ...preferences, [key]: !preferences[key] });
  }

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="tech-panel rounded-3xl p-6">
          <p className="tech-kicker">Email preferences</p>
          <h1 className="mt-2 text-3xl font-semibold">Choose what Mia sends you</h1>
          <p className="mt-3 text-sm text-slate-600">
            Manage property matches, lead nurture follow-ups, and occasional HeyMies updates.
          </p>

          {loading ? <p className="mt-6 text-sm text-slate-600">Loading preferences...</p> : null}

          {!loading && !token ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Open this page from the manage-preferences link in a HeyMies email.
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}

          {preferences ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-600">
                Preferences for <span className="font-semibold">{preferences.email ?? "your account"}</span>
              </p>

              <PreferenceToggle
                checked={preferences.match_alert_emails}
                disabled={saving}
                label="New listing match alerts"
                onClick={() => update("match_alert_emails")}
              />
              <PreferenceToggle
                checked={preferences.nurture_emails}
                disabled={saving}
                label="Mia follow-ups on enquiries"
                onClick={() => update("nurture_emails")}
              />
              <PreferenceToggle
                checked={preferences.marketing_emails}
                disabled={saving}
                label="HeyMies product updates"
                onClick={() => update("marketing_emails")}
              />

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  save({
                    ...preferences,
                    marketing_emails: false,
                    nurture_emails: false,
                    match_alert_emails: false,
                  })
                }
                className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                Unsubscribe from all
              </button>
            </div>
          ) : null}

          <div className="mt-8">
            <Link href="/" className="tech-button-secondary rounded-xl px-4 py-2 text-sm font-semibold">
              Back to HeyMies
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function PreferenceToggle({
  checked,
  disabled,
  label,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
    >
      <span className="font-medium text-slate-800">{label}</span>
      <span
        className={[
          "rounded-full border px-3 py-1 text-xs font-semibold",
          checked
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-slate-50 text-slate-600",
        ].join(" ")}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
