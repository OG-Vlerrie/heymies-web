export const dynamic = "force-dynamic";

import Link from "next/link";
import { describeSupabaseAdminKey, supabaseAdmin } from "@/lib/supabase/admin";

type HealthStatus = "ok" | "warn" | "bad";

type HealthCheck = {
  label: string;
  status: HealthStatus;
  detail: string;
};

type EventRow = {
  id: string;
  enquiry_id: string | null;
  event_type: string;
  message: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

type MatchRow = {
  id: string;
  status: string | null;
  sent_at: string | null;
  created_at: string;
  score: number | null;
  listing?: { title: string | null } | null;
};

type ApiErrorRow = {
  id: string;
  created_at: string;
  route: string;
  method: string;
  status: number | null;
  error_message: string;
  error_code: string | null;
};

export default async function AdminHealthPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY?.trim() ?? "";
  const resendKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const emailFrom = process.env.EMAIL_FROM?.trim() ?? "";
  const cronSecret = process.env.CRON_SECRET?.trim() ?? "";
  const nurtureSecret = process.env.NURTURE_JOB_SECRET?.trim() ?? "";
  const matchingSecret = process.env.MATCHING_JOB_SECRET?.trim() ?? "";

  const configChecks: HealthCheck[] = [
    checkPresent("Supabase URL", supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL is required for Supabase clients."),
    checkPresent("Supabase anon key", anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required for browser auth."),
    checkPresent("Supabase admin key", serviceRole || supabaseSecret, "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required for admin, Mia, and cron jobs."),
    {
      label: "Supabase admin key fingerprint",
      status: adminKeyStatus(describeSupabaseAdminKey()),
      detail: adminKeyDetail(describeSupabaseAdminKey()),
    },
    checkPresent("Resend API key", resendKey, "RESEND_API_KEY is required for all app-sent emails."),
    {
      label: "Email sender",
      status: emailFrom ? (emailFrom.includes("@heymies.co.za") ? "ok" : "warn") : "bad",
      detail: emailFrom
        ? `${emailFrom}${emailFrom.includes("@heymies.co.za") ? "" : " - sender should normally use the verified heymies.co.za domain."}`
        : "EMAIL_FROM is missing.",
    },
    {
      label: "Nurture cron secret",
      status: cronSecret || nurtureSecret ? "ok" : "bad",
      detail: cronSecret || nurtureSecret
        ? "CRON_SECRET or NURTURE_JOB_SECRET is configured."
        : "CRON_SECRET or NURTURE_JOB_SECRET is required for scheduled Mia nurture.",
    },
    {
      label: "Matching secret",
      status: matchingSecret ? "ok" : "warn",
      detail: matchingSecret
        ? "MATCHING_JOB_SECRET is set. Dashboard and admin matching triggers use server-side proxy routes."
        : "No matching secret is set. Set MATCHING_JOB_SECRET before public beta.",
    },
  ];

  const dbChecks: HealthCheck[] = [];
  let dueNurtureCount = 0;
  let staleNurtureCount = 0;
  let activeListingsWithoutPhotos = 0;
  let oldPendingMatches = 0;
  let recentApiErrorCount = 0;
  let recentFailures: string[] = [];
  let events: EventRow[] = [];
  let matches: MatchRow[] = [];
  let apiErrors: ApiErrorRow[] = [];

  if (supabaseUrl && (serviceRole || supabaseSecret)) {
    const supabase = supabaseAdmin();
    const now = Date.now();
    const dayAgoIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgoIso = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

    const [
      profilesCount,
      listingsProbe,
      dueNurture,
      staleNurture,
      photoHealth,
      recentEvents,
      recentMatches,
      pendingMatches,
      preferenceProbe,
      apiErrorsProbe,
      recentApiErrors,
    ] = await Promise.all([
      safeCount(supabase.from("profiles").select("id", { count: "exact", head: true }), "profiles"),
      safeCount(supabase.from("listings").select("id", { count: "exact", head: true }), "listings"),
      safeCount(
        supabase
          .from("enquiries")
          .select("id", { count: "exact", head: true })
          .not("next_nurture_at", "is", null)
          .lte("next_nurture_at", new Date().toISOString())
          .in("nurture_status", ["pending", "nurturing"]),
        "due nurture"
      ),
      safeCount(
        supabase
          .from("enquiries")
          .select("id", { count: "exact", head: true })
          .not("next_nurture_at", "is", null)
          .lte("next_nurture_at", dayAgoIso)
          .in("nurture_status", ["pending", "nurturing"]),
        "stale nurture"
      ),
      safeRows<any>(
        supabase
          .from("listings")
          .select("id,title,images,cover_image")
          .eq("status", "active")
          .limit(500),
        "active listing photo health"
      ),
      safeRows<EventRow>(
        supabase
          .from("enquiry_events")
          .select("id,enquiry_id,event_type,message,metadata,created_at")
          .in("event_type", [
            "nurture_sent",
            "admin_triggered_nurture",
            "nurture_paused",
            "buyer_response",
            "admin_note",
          ])
          .order("created_at", { ascending: false })
          .limit(30),
        "recent Mia events"
      ),
      safeRows<MatchRow>(
        supabase
          .from("match_events")
          .select("id,status,sent_at,created_at,score,listing:listings(title)")
          .order("created_at", { ascending: false })
          .limit(30),
        "recent match events"
      ),
      safeCount(
        supabase
          .from("match_events")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .lte("created_at", threeDaysAgoIso),
        "old pending matches"
      ),
      safeCount(
        supabase.from("email_preferences").select("id", { count: "exact", head: true }),
        "email preferences"
      ),
      safeCount(
        supabase
          .from("api_error_events")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
        "API errors"
      ),
      safeRows<ApiErrorRow>(
        supabase
          .from("api_error_events")
          .select("id,created_at,route,method,status,error_message,error_code")
          .order("created_at", { ascending: false })
          .limit(20),
        "recent API errors"
      ),
    ]);

    dbChecks.push(
      {
        label: "Supabase admin connection",
        status: profilesCount.error ? "bad" : "ok",
        detail: profilesCount.error ?? `Profiles table reachable. ${profilesCount.count ?? 0} rows visible.`,
      },
      {
        label: "Listings table",
        status: listingsProbe.error ? "bad" : "ok",
        detail: listingsProbe.error ?? `Listings table reachable. ${listingsProbe.count ?? 0} rows visible.`,
      },
      {
        label: "Email preferences table",
        status: preferenceProbe.error ? "bad" : "ok",
        detail: preferenceProbe.error ?? `Email preferences reachable. ${preferenceProbe.count ?? 0} rows visible.`,
      }
    );

    dueNurtureCount = dueNurture.count ?? 0;
    staleNurtureCount = staleNurture.count ?? 0;
    activeListingsWithoutPhotos = photoHealth.data.filter(
      (listing) => !(Array.isArray(listing.images) && listing.images.length > 0) && !listing.cover_image
    ).length;
    events = recentEvents.data;
    matches = normalizeRows<MatchRow>(recentMatches.data, "listing");
    oldPendingMatches = pendingMatches.count ?? 0;
    recentApiErrorCount = apiErrorsProbe.count ?? 0;
    apiErrors = recentApiErrors.data;
    recentFailures = events.flatMap((event) => {
      const errors = event.metadata?.errors;
      if (Array.isArray(errors) && errors.length > 0) return errors.map(String);
      return [];
    });

    dbChecks.push(
      {
        label: "Due nurture backlog",
        status: dueNurture.error ? "bad" : staleNurtureCount > 0 ? "warn" : "ok",
        detail: dueNurture.error ?? `${dueNurtureCount} due now. ${staleNurtureCount} older than 24 hours.`,
      },
      {
        label: "Active listing photo health",
        status: photoHealth.error ? "bad" : activeListingsWithoutPhotos > 0 ? "warn" : "ok",
        detail: photoHealth.error ?? `${activeListingsWithoutPhotos} active listings have no photos.`,
      },
      {
        label: "Pending match backlog",
        status: pendingMatches.error ? "bad" : oldPendingMatches > 0 ? "warn" : "ok",
        detail: pendingMatches.error ?? `${oldPendingMatches} pending match events are older than 3 days.`,
      },
      {
        label: "Recent recorded email failures",
        status: recentFailures.length > 0 ? "warn" : "ok",
        detail:
          recentFailures.length > 0
            ? `${recentFailures.length} recent nurture-run errors found in event metadata.`
            : "No recent failure metadata found. Some provider errors may still only be in server logs.",
      },
      {
        label: "API error events",
        status: apiErrorsProbe.error ? "bad" : recentApiErrorCount > 0 ? "warn" : "ok",
        detail: apiErrorsProbe.error ?? `${recentApiErrorCount} API errors recorded in the last 24 hours.`,
      }
    );
  } else {
    dbChecks.push({
      label: "Supabase admin connection",
      status: "bad",
      detail: "Cannot check database health until Supabase URL and service role are configured.",
    });
  }

  const allChecks = [...configChecks, ...dbChecks];
  const status = overallStatus(allChecks);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700">
              Back to admin
            </Link>
            <p className="tech-kicker mt-6">System health</p>
            <h1 className="mt-2 text-3xl font-semibold">HeyMies Health Check</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Configuration, cron readiness, Mia nurture activity, matching backlog, and operational warnings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/pipeline" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Lead pipeline
            </Link>
            <Link href="/admin/health" className="tech-button-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Refresh checks
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Overall" value={statusLabel(status)} tone={status} />
          <Metric label="Due nurture" value={dueNurtureCount} tone={staleNurtureCount > 0 ? "warn" : "ok"} />
          <Metric label="Photo issues" value={activeListingsWithoutPhotos} tone={activeListingsWithoutPhotos > 0 ? "warn" : "ok"} />
          <Metric label="API errors 24h" value={recentApiErrorCount} tone={recentApiErrorCount > 0 ? "warn" : "ok"} />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent API Errors</h2>
              <p className="mt-1 text-sm text-slate-600">
                Server-side route failures captured for Alpha debugging.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {recentApiErrorCount} in 24h
            </span>
          </div>

          {apiErrors.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              No API errors recorded yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {apiErrors.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.route}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {event.method} / {event.status ?? "-"} / {formatDate(event.created_at)}
                      </p>
                    </div>
                    {event.error_code ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        {event.error_code}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{event.error_message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Configuration">
            <CheckList checks={configChecks} />
          </Panel>

          <Panel title="Database and Jobs">
            <CheckList checks={dbChecks} />
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Mia Activity">
            {events.length === 0 ? (
              <p className="text-sm text-slate-600">No recent Mia activity found.</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 12).map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold">{event.event_type.replaceAll("_", " ")}</p>
                      <span className="text-xs text-slate-500">{formatDate(event.created_at)}</span>
                    </div>
                    {event.message ? <p className="mt-2 text-sm text-slate-700">{event.message}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Recent Matching Activity">
            {matches.length === 0 ? (
              <p className="text-sm text-slate-600">No recent match events found.</p>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 12).map((match) => (
                  <div key={match.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold">{match.listing?.title ?? "Listing match"}</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {match.status ?? "pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Score {match.score ?? 0}% / {formatDate(match.sent_at ?? match.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {recentFailures.length > 0 ? (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <h2 className="text-lg font-semibold">Recent Failure Metadata</h2>
            <ul className="mt-4 space-y-2">
              {recentFailures.slice(0, 10).map((failure, index) => (
                <li key={`${failure}-${index}`}>{failure}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function checkPresent(label: string, value: string, missingDetail: string): HealthCheck {
  return {
    label,
    status: value ? "ok" : "bad",
    detail: value ? "Configured." : missingDetail,
  };
}

function adminKeyStatus(info: ReturnType<typeof describeSupabaseAdminKey>): HealthStatus {
  if (info.keyType === "missing" || info.keyType === "publishable") return "bad";
  if (info.keyType === "jwt" && info.jwtRole !== "service_role") return "bad";
  if (info.keyType === "jwt" && info.jwtRef && info.anonRef && info.jwtRef !== info.anonRef) return "bad";
  if (info.keyType === "unknown") return "warn";
  return "ok";
}

function adminKeyDetail(info: ReturnType<typeof describeSupabaseAdminKey>) {
  const parts = [
    `URL project: ${info.projectRef}`,
    `key type: ${info.keyType}`,
    `length: ${info.keyLength}`,
  ];

  if (info.jwtRole) parts.push(`JWT role: ${info.jwtRole}`);
  if (info.jwtRef) parts.push(`JWT project: ${info.jwtRef}`);
  if (info.anonRef) parts.push(`anon project: ${info.anonRef}`);

  if (info.keyType === "publishable") {
    parts.push("This is a public key, not an admin key.");
  }

  if (info.keyType === "jwt" && info.jwtRole !== "service_role") {
    parts.push("Expected JWT role service_role.");
  }

  if (info.keyType === "jwt" && info.jwtRef && info.anonRef && info.jwtRef !== info.anonRef) {
    parts.push("Admin key and anon key belong to different Supabase projects.");
  }

  return parts.join(" / ");
}

async function safeCount(query: PromiseLike<any>, label: string) {
  const result = await query;
  if (result.error) return { count: 0, error: `${label}: ${result.error.message}` };
  return { count: result.count ?? 0, error: null };
}

async function safeRows<T>(query: PromiseLike<any>, label: string) {
  const result = await query;
  if (result.error) return { data: [] as T[], error: `${label}: ${result.error.message}` };
  return { data: (result.data ?? []) as T[], error: null };
}

function normalizeRows<T extends Record<string, any>>(rows: T[], key: string) {
  return rows.map((row) => ({
    ...row,
    [key]: Array.isArray(row[key]) ? row[key][0] : row[key],
  }));
}

function overallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === "bad")) return "bad";
  if (checks.some((check) => check.status === "warn")) return "warn";
  return "ok";
}

function statusLabel(status: HealthStatus) {
  if (status === "ok") return "Healthy";
  if (status === "warn") return "Watch";
  return "Action";
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: HealthStatus;
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CheckList({ checks }: { checks: HealthCheck[] }) {
  return (
    <div className="space-y-3">
      {checks.map((check) => (
        <div key={check.label} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="font-semibold">{check.label}</p>
            <StatusPill status={check.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: HealthStatus }) {
  const cls =
    status === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status === "ok" ? "OK" : status === "warn" ? "Watch" : "Fix"}
    </span>
  );
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
