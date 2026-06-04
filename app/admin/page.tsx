export const dynamic = "force-dynamic";

import Link from "next/link";
import LeadTable from "./LeadTable";
import AgentTable from "./AgentTable";
import QualityPanel from "./QualityPanel";
import { formatDateTimeZA } from "@/lib/display-format";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Lead = {
  id: string;
  email: string;
  source: string | null;
  tag: string | null;
  created_at: string;
};

type Agent = {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  full_name: string;
  email: string;
  phone: string | null;
  agency: string | null;
  ffc_number: string | null;
  avg_commission_percent: number | null;
  avg_commission_band: string | null;
  areas: string | null;
  property_types: string | null;
  max_leads_per_week: number | null;
  preferred_contact_time: string | null;
};

type AgentRow = Record<string, any>;

type ApiErrorEvent = {
  id: string;
  created_at: string;
  route: string;
  method: string;
  status: number | null;
  error_message: string;
  user_id: string | null;
};

type AdminQuery<T> = {
  data: T[];
  count: number | null;
  error: string | null;
};

export default async function AdminPage() {
  const supabase = supabaseAdmin();
  const nowIso = new Date().toISOString();

  const [
    leadsResult,
    agentsResult,
    alertsResult,
    matchEventsResult,
    buyersCount,
    sellersCount,
    listingsActiveCount,
    listingsDraftCount,
    enquiriesCount,
    agentReadyCount,
    dueNurtureCount,
    pausedNurtureCount,
    apiErrorsCount,
    apiErrorsResult,
  ] = await Promise.all([
    safeRows<Lead>(
      supabase
        .from("leads")
        .select("id,email,source,tag,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      "Leads"
    ),
    safeRows<AgentRow>(
      supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      "Agents"
    ),
    safeRows<any>(
      supabase
        .from("buyer_alerts")
        .select("id,name,enabled,areas,max_price,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      "Buyer alerts"
    ),
    safeRows<any>(
      supabase
        .from("match_events")
        .select("id,score,reasons,status,created_at,listing:listings(title)")
        .order("created_at", { ascending: false })
        .limit(100),
      "Match events"
    ),
    safeCount(supabase.from("buyers").select("id", { count: "exact", head: true }), "Buyers"),
    safeCount(
      supabase.from("private_sellers").select("id", { count: "exact", head: true }),
      "Private sellers"
    ),
    safeCount(
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      "Active listings"
    ),
    safeCount(
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      "Draft listings"
    ),
    safeCount(
      supabase.from("enquiries").select("id", { count: "exact", head: true }),
      "Enquiries"
    ),
    safeCount(
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("qualification_status", "agent_ready"),
      "Agent-ready leads"
    ),
    safeCount(
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .not("next_nurture_at", "is", null)
        .lte("next_nurture_at", nowIso)
        .in("nurture_status", ["nurturing", "pending"]),
      "Due nurture"
    ),
    safeCount(
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("nurture_status", "paused"),
      "Paused nurture"
    ),
    safeCount(
      supabase
        .from("api_error_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      "API errors"
    ),
    safeRows<ApiErrorEvent>(
      supabase
        .from("api_error_events")
        .select("id,created_at,route,method,status,error_message,user_id")
        .order("created_at", { ascending: false })
        .limit(12),
      "Recent API errors"
    ),
  ]);

  const warnings = [
    leadsResult.error,
    agentsResult.error,
    alertsResult.error,
    matchEventsResult.error,
    buyersCount.error,
    sellersCount.error,
    listingsActiveCount.error,
    listingsDraftCount.error,
    enquiriesCount.error,
    agentReadyCount.error,
    dueNurtureCount.error,
    pausedNurtureCount.error,
    apiErrorsCount.error,
    apiErrorsResult.error,
  ].filter(Boolean) as string[];

  const leads = leadsResult.data;
  const agents = normalizeAgents(agentsResult.data);
  const pendingAgents = agents.filter((agent) => agent.status === "pending").length;
  const activeAlerts = alertsResult.data.filter((alert) => alert.enabled).length;
  const pendingMatches = matchEventsResult.data.filter((event) => event.status === "pending").length;

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="tech-kicker">Master admin</p>
              <h1 className="mt-2 text-3xl font-semibold">HeyMies Control Room</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Monitor listings, signups, lead quality, Mia nurture, agent applications,
                and buyer matching from one protected admin area.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/health"
                className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                System Health
              </Link>
              <Link
                href="/admin/launch"
                className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Launch Readiness
              </Link>
              <Link
                href="/admin/qa"
                className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                QA Checklist
              </Link>
              <Link
                href="/admin/marketing"
                className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Marketing
              </Link>
              <Link
                href="/admin/mia"
                className="tech-button-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Open Mia Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                App dashboard
              </Link>
            </div>
          </div>
        </header>

        {warnings.length > 0 ? (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some admin data could not be loaded.</p>
            <ul className="mt-2 grid gap-1 md:grid-cols-2">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Buyers" value={buyersCount.count} />
          <Metric label="Private sellers" value={sellersCount.count} />
          <Metric label="Active listings" value={listingsActiveCount.count} />
          <Metric label="Draft listings" value={listingsDraftCount.count} tone="warn" />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total enquiries" value={enquiriesCount.count} />
          <Metric label="Agent-ready" value={agentReadyCount.count} tone="good" />
          <Metric label="Due nurture" value={dueNurtureCount.count} tone="warn" />
          <Metric
            label="API errors 24h"
            value={apiErrorsCount.count}
            tone={(apiErrorsCount.count ?? 0) > 0 ? "bad" : "good"}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <AdminCard
            title="Reports"
            body="Review weekly performance, admin audit activity, lead outcomes, and export CSV reports."
            href="/admin/reports"
            stat="Metrics"
          />
          <AdminCard
            title="Marketing assets"
            body="Copy-ready reel scripts, carousel concepts, headlines, primary text, and CTA ideas for agent ads."
            href="/admin/marketing"
            stat="Ad copy"
          />
          <AdminCard
            title="Launch readiness"
            body="Check whether HeyMies is alpha-ready, beta-ready, or blocked by config, data, email, or listing quality."
            href="/admin/launch"
            stat="Go/no-go"
          />
          <AdminCard
            title="QA checklist"
            body="Run repeatable production checks for signup, listings, Mia, preferences, and matching."
            href="/admin/qa"
            stat="Manual test"
          />
          <AdminCard
            title="Lead pipeline"
            body="Work enquiries by stage, pause or resume Mia, mark agent-ready, and close won or lost."
            href="/admin/pipeline"
            stat={`${agentReadyCount.count ?? 0} ready`}
          />
          <AdminCard
            title="Mia"
            body="See follow-ups, buyer clicks, paused nurture, agent-ready leads, and run Mia manually."
            href="/admin/mia"
            stat={`${dueNurtureCount.count ?? 0} due`}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <AdminCard
            title="Listings"
            body="Review active, draft, and inactive listings, spot missing photos, and control publication status."
            href="/admin/listings"
            stat={`${listingsDraftCount.count ?? 0} drafts`}
          />
          <AdminCard
            title="System health"
            body="Check email config, Supabase access, API errors, cron readiness, nurture backlog, and matching activity."
            href="/admin/health"
            stat={`${apiErrorsCount.count ?? 0} API errors`}
          />
          <AdminCard
            title="Users"
            body="Check confirmed signups, profile roles, contact details, and email preference health."
            href="/admin/users"
            stat={`${buyersCount.count ?? 0} buyers`}
          />
          <AdminCard
            title="Agent applications"
            body="Approve, reject, or review agent onboarding applications."
            href="#agents"
            stat={`${pendingAgents} pending`}
          />
          <AdminCard
            title="Quality engine"
            body="Review buyer alerts, match events, and run listing matching."
            href="#quality"
            stat={`${activeAlerts} active alerts`}
          />
        </section>

        <section id="api-errors" className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">API Errors</h2>
              <p className="mt-1 text-sm text-slate-600">
                Recent server-side API failures captured during Alpha testing.
              </p>
            </div>
            <Link href="/admin/health" className="text-sm font-semibold text-emerald-700">
              Open health
            </Link>
          </div>

          {apiErrorsResult.error ? (
            <Unavailable message={apiErrorsResult.error} />
          ) : apiErrorsResult.data.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              No API errors recorded yet.
            </p>
          ) : (
            <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Time</th>
                    <th className="px-4 py-3 text-left font-semibold">Route</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {apiErrorsResult.data.map((event) => (
                    <tr key={event.id} className="border-t border-slate-200">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDateTimeZA(event.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{event.route}</p>
                        <p className="text-xs text-slate-500">{event.method}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{event.status ?? "-"}</td>
                      <td className="max-w-xl px-4 py-3 text-slate-700">{event.error_message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="leads" className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Early Access Leads</h2>
              <p className="mt-1 text-sm text-slate-600">
                Latest website leads, tags, and list cleanup.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {leads.length} loaded
            </span>
          </div>
          {leadsResult.error ? (
            <Unavailable message={leadsResult.error} />
          ) : (
            <LeadTable initialLeads={leads} />
          )}
        </section>

        <section id="quality" className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quality Engine</h2>
              <p className="mt-1 text-sm text-slate-600">
                Buyer alerts, pending matches, sent matches, and manual matcher controls.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {pendingMatches} pending matches
            </span>
          </div>
          <QualityPanel
            alerts={alertsResult.data}
            matchEvents={matchEventsResult.data}
            unavailable={alertsResult.error ?? matchEventsResult.error}
          />
        </section>

        <section id="agents" className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Agent Applications</h2>
              <p className="mt-1 text-sm text-slate-600">
                Applications from agent signup and onboarding flows.
              </p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              {pendingAgents} pending
            </span>
          </div>
          {agentsResult.error ? (
            <Unavailable message={agentsResult.error} />
          ) : (
            <AgentTable initialAgents={agents} />
          )}
        </section>
      </div>
    </main>
  );
}

async function safeRows<T>(query: PromiseLike<any>, label: string): Promise<AdminQuery<T>> {
  const result = await query;

  if (result.error) {
    return {
      data: [],
      count: null,
      error: `${label}: ${result.error.message}`,
    };
  }

  return {
    data: (result.data ?? []) as T[],
    count: result.count ?? null,
    error: null,
  };
}

async function safeCount(query: PromiseLike<any>, label: string) {
  const result = await query;

  if (result.error) {
    return {
      count: null,
      error: `${label}: ${result.error.message}`,
    };
  }

  return {
    count: result.count ?? 0,
    error: null,
  };
}

function normalizeAgents(rows: AgentRow[]) {
  return rows.map((agent) => ({
    id: String(agent.id),
    created_at: agent.created_at ?? new Date().toISOString(),
    status: normalizeStatus(agent.status),
    full_name: agent.full_name ?? "-",
    email: agent.email ?? agent.contact_email ?? "",
    phone: agent.phone ?? null,
    agency: agent.agency ?? agent.agency_name ?? null,
    ffc_number: agent.ffc_number ?? null,
    avg_commission_percent: agent.avg_commission_percent ?? null,
    avg_commission_band: agent.avg_commission_band ?? null,
    areas: agent.areas ?? agent.service_areas ?? null,
    property_types: agent.property_types ?? agent.specialties ?? null,
    max_leads_per_week: agent.max_leads_per_week ?? null,
    preferred_contact_time: agent.preferred_contact_time ?? agent.preferred_contact ?? null,
  })) as Agent[];
}

function normalizeStatus(status: unknown): Agent["status"] {
  if (status === "approved" || status === "rejected" || status === "pending") {
    return status;
  }

  return "pending";
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | null;
  tone?: "neutral" | "good" | "warn" | "bad" | "muted";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : tone === "bad"
          ? "border-red-200 bg-red-50 text-red-700"
        : tone === "muted"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value ?? "-"}</p>
    </div>
  );
}

function AdminCard({
  title,
  body,
  href,
  stat,
}: {
  title: string;
  body: string;
  href: string;
  stat: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/30"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {stat}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
      This section is unavailable. {message}
    </div>
  );
}
