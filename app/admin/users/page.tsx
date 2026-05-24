export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminUsersTable from "./AdminUsersTable";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ProfileRow = {
  id: string;
  role: string | null;
  full_name: string | null;
  phone: string | null;
};

type EmailPreferenceRow = {
  user_id: string | null;
  email: string | null;
  marketing_emails: boolean;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  metadata_role: string | null;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  marketing_emails: boolean | null;
  nurture_emails: boolean | null;
  match_alert_emails: boolean | null;
  unsubscribed_at: string | null;
};

export default async function AdminUsersPage() {
  const supabase = supabaseAdmin();

  const [authResult, profilesResult, preferencesResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 500 }),
    supabase.from("profiles").select("id,role,full_name,phone").limit(1000),
    supabase
      .from("email_preferences")
      .select("user_id,email,marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
      .limit(1000),
  ]);

  const authUsers = authResult.data?.users ?? [];
  const authError = authResult.error?.message ?? null;
  const profileError = profilesResult.error?.message ?? null;
  const preferenceError = preferencesResult.error?.message ?? null;

  const profiles = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  );
  const preferences = new Map(
    ((preferencesResult.data ?? []) as EmailPreferenceRow[])
      .filter((preference) => preference.user_id)
      .map((preference) => [preference.user_id as string, preference])
  );

  const users: AdminUser[] = authUsers.map((user) => {
    const profile = profiles.get(user.id);
    const preference = preferences.get(user.id);
    return {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      metadata_role: typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null,
      role: profile?.role ?? null,
      full_name: profile?.full_name ?? null,
      phone: profile?.phone ?? null,
      marketing_emails: preference?.marketing_emails ?? null,
      nurture_emails: preference?.nurture_emails ?? null,
      match_alert_emails: preference?.match_alert_emails ?? null,
      unsubscribed_at: preference?.unsubscribed_at ?? null,
    };
  });

  const missingProfiles = users.filter((user) => !user.role).length;
  const confirmed = users.filter((user) => user.email_confirmed_at).length;
  const unsubscribed = users.filter((user) => user.unsubscribed_at).length;
  const warnings = [
    authError ? `Auth users unavailable: ${authError}` : null,
    profileError ? `Profiles unavailable: ${profileError}` : null,
    preferenceError ? `Email preferences unavailable: ${preferenceError}` : null,
  ].filter(Boolean) as string[];

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Master admin</p>
            <h1 className="mt-2 text-3xl font-semibold">Users and Profiles</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Check signup confirmation, profile roles, contact details, and email preference health.
            </p>
          </div>
          <Link
            href="/admin"
            className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Admin home
          </Link>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some user data could not be loaded.</p>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Auth users" value={users.length} tone="neutral" />
          <Metric label="Confirmed" value={confirmed} tone="good" />
          <Metric label="Missing profile" value={missingProfiles} tone="warn" />
          <Metric label="Unsubscribed" value={unsubscribed} tone="muted" />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Profile Control</h2>
              <p className="mt-1 text-sm text-slate-600">
                Correct roles when signup metadata and profile rows disagree.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {users.length} loaded
            </span>
          </div>
          <AdminUsersTable initialUsers={users} />
        </section>
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link href="/admin" className="text-sm font-semibold text-emerald-700">
      Back to admin
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "good" | "warn" | "muted";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : tone === "muted"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
