export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CountResult = {
  count: number;
  error: string | null;
};

type ActivityRow = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  event_type: string;
  message: string | null;
  created_at: string;
  enquiry?: { full_name: string | null; email: string | null; listing?: { title: string | null } | null } | null;
};

export default async function AdminReportsPage() {
  const supabase = supabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    buyers,
    sellers,
    listings,
    activeListings,
    enquiries,
    agentReady,
    won,
    lost,
    nurtureSent,
    buyerResponses,
    matchEmails,
    adminActivity,
    leadActivity,
  ] = await Promise.all([
    safeCount(supabase.from("buyers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo), "buyers"),
    safeCount(supabase.from("private_sellers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo), "private sellers"),
    safeCount(supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", weekAgo), "listings"),
    safeCount(supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"), "active listings"),
    safeCount(supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("first_enquired_at", weekAgo), "enquiries"),
    safeCount(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("qualification_status", "agent_ready").gte("agent_ready_at", weekAgo), "agent-ready"),
    safeCount(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "won"), "won"),
    safeCount(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "lost"), "lost"),
    safeCount(supabase.from("enquiry_events").select("id", { count: "exact", head: true }).eq("event_type", "nurture_sent").gte("created_at", weekAgo), "nurture sent"),
    safeCount(supabase.from("enquiry_events").select("id", { count: "exact", head: true }).eq("event_type", "buyer_response").gte("created_at", weekAgo), "buyer responses"),
    safeCount(supabase.from("match_events").select("id", { count: "exact", head: true }).not("sent_at", "is", null).gte("sent_at", weekAgo), "match emails"),
    safeRows<ActivityRow>(
      supabase
        .from("admin_activity")
        .select("id,actor,action,entity_type,entity_id,summary,created_at")
        .order("created_at", { ascending: false })
        .limit(80),
      "admin activity"
    ),
    safeRows<EventRow>(
      supabase
        .from("enquiry_events")
        .select("id,event_type,message,created_at,enquiry:enquiries(full_name,email,listing:listings(title))")
        .in("event_type", ["admin_updated", "admin_note", "admin_triggered_nurture", "nurture_sent", "buyer_response"])
        .order("created_at", { ascending: false })
        .limit(80),
      "lead activity"
    ),
  ]);

  const warnings = [
    buyers.error,
    sellers.error,
    listings.error,
    activeListings.error,
    enquiries.error,
    agentReady.error,
    won.error,
    lost.error,
    nurtureSent.error,
    buyerResponses.error,
    matchEmails.error,
    adminActivity.error,
    leadActivity.error,
  ].filter(Boolean) as string[];

  const conversion =
    enquiries.count > 0 ? Math.round((agentReady.count / Math.max(enquiries.count, 1)) * 100) : 0;

  const exports = [
    ["Pipeline", "pipeline"],
    ["Agent-ready leads", "agent-ready"],
    ["Buyers", "buyers"],
    ["Listings", "listings"],
    ["Early leads", "leads"],
    ["Admin activity", "activity"],
  ];

  const activityRows = [
    ...adminActivity.data.map((row) => ({
      id: `admin-${row.id}`,
      type: row.action,
      title: row.summary ?? row.action,
      meta: `${row.entity_type}${row.actor ? ` / ${row.actor}` : ""}`,
      date: row.created_at,
    })),
    ...normalizeRows<EventRow>(leadActivity.data, "enquiry").map((row) => ({
      id: `lead-${row.id}`,
      type: row.event_type,
      title: row.message ?? row.event_type.replaceAll("_", " "),
      meta: `${row.enquiry?.full_name ?? row.enquiry?.email ?? "Lead"} / ${row.enquiry?.listing?.title ?? "Listing"}`,
      date: row.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 80);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700">
              Back to admin
            </Link>
            <p className="tech-kicker mt-6">Admin reports</p>
            <h1 className="mt-2 text-3xl font-semibold">Performance and Audit</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Weekly operating metrics, admin activity, lead audit trail, and CSV exports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/audit" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Audit trail
            </Link>
            <Link href="/admin/health" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              System health
            </Link>
          </div>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some report data could not be loaded.</p>
            <ul className="mt-2 grid gap-1 md:grid-cols-2">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="New buyers" value={buyers.count} tone="neutral" />
          <Metric label="New sellers" value={sellers.count} tone="neutral" />
          <Metric label="New listings" value={listings.count} tone="neutral" />
          <Metric label="Active listings" value={activeListings.count} tone="good" />
          <Metric label="New enquiries" value={enquiries.count} tone="neutral" />
          <Metric label="Agent-ready" value={agentReady.count} tone="good" />
          <Metric label="Ready conversion" value={`${conversion}%`} tone={conversion >= 30 ? "good" : "warn"} />
          <Metric label="Won / Lost" value={`${won.count} / ${lost.count}`} tone="muted" />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Mia emails sent" value={nurtureSent.count} tone="neutral" />
          <Metric label="Buyer responses" value={buyerResponses.count} tone="good" />
          <Metric label="Match emails sent" value={matchEmails.count} tone="neutral" />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">CSV Exports</h2>
          <p className="mt-1 text-sm text-slate-600">
            Download clean snapshots for follow-up, analysis, or backup.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {exports.map(([label, type]) => (
              <a
                key={type}
                href={`/api/admin/exports?type=${type}`}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Export {label}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Audit Trail</h2>
              <p className="mt-1 text-sm text-slate-600">
                Admin actions and key Mia lead events, newest first.
              </p>
            </div>
            <Link href="/admin/audit" className="text-sm font-semibold text-emerald-700">
              Open full audit
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {activityRows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{row.title}</p>
                  <span className="text-xs text-slate-500">{formatDate(row.date)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {row.type.replaceAll("_", " ")} / {row.meta}
                </p>
              </div>
            ))}
            {activityRows.length === 0 ? <p className="text-sm text-slate-600">No audit activity yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

async function safeCount(query: PromiseLike<any>, label: string): Promise<CountResult> {
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
  })) as T[];
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
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
