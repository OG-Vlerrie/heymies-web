export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

type AdminActivity = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type LeadEvent = {
  id: string;
  event_type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  enquiry?: {
    id: string;
    full_name: string | null;
    email: string | null;
    listing?: { title: string | null } | null;
  } | null;
};

export default async function AdminAuditPage() {
  const supabase = supabaseAdmin();

  const [adminResult, leadResult] = await Promise.all([
    safeRows<AdminActivity>(
      supabase
        .from("admin_activity")
        .select("id,actor,action,entity_type,entity_id,summary,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(250),
      "admin activity"
    ),
    safeRows<LeadEvent>(
      supabase
        .from("enquiry_events")
        .select("id,event_type,message,metadata,created_at,enquiry:enquiries(id,full_name,email,listing:listings(title))")
        .in("event_type", [
          "admin_updated",
          "admin_note",
          "admin_triggered_nurture",
          "nurture_sent",
          "nurture_paused",
          "buyer_response",
        ])
        .order("created_at", { ascending: false })
        .limit(250),
      "lead events"
    ),
  ]);

  const warnings = [adminResult.error, leadResult.error].filter(Boolean) as string[];
  const adminRows = adminResult.data.map((row) => ({
    id: `admin-${row.id}`,
    source: "Admin",
    action: row.action,
    title: row.summary ?? row.action,
    entity: `${row.entity_type}${row.entity_id ? ` / ${row.entity_id}` : ""}`,
    actor: row.actor ?? "admin",
    metadata: row.metadata,
    date: row.created_at,
    href:
      row.entity_type === "enquiry" && row.entity_id
        ? `/admin/enquiries/${row.entity_id}`
        : row.entity_type === "listing" && row.entity_id
          ? `/admin/listings/${row.entity_id}`
          : null,
  }));

  const leadRows = normalizeRows<LeadEvent>(leadResult.data, "enquiry").map((row) => ({
    id: `lead-${row.id}`,
    source: "Lead",
    action: row.event_type,
    title: row.message ?? row.event_type.replaceAll("_", " "),
    entity: `${row.enquiry?.full_name ?? row.enquiry?.email ?? "Buyer"} / ${row.enquiry?.listing?.title ?? "Listing"}`,
    actor: "system",
    metadata: row.metadata,
    date: row.created_at,
    href: row.enquiry?.id ? `/admin/enquiries/${row.enquiry.id}` : null,
  }));

  const rows = [...adminRows, ...leadRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin/reports" className="text-sm font-semibold text-emerald-700">
              Back to reports
            </Link>
            <p className="tech-kicker mt-6">Admin audit</p>
            <h1 className="mt-2 text-3xl font-semibold">Activity Trail</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Admin actions, lead notes, Mia sends, buyer responses, listing status changes, and outcome changes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/exports?type=activity"
              className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Export activity
            </a>
            <Link href="/admin/reports" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Reports
            </Link>
          </div>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some audit data could not be loaded.</p>
            <ul className="mt-2 grid gap-1 md:grid-cols-2">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-600">{rows.length} records loaded.</p>
            </div>
          </div>

          <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">When</th>
                  <th className="px-4 py-3 text-left font-semibold">Source</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold">Summary</th>
                  <th className="px-4 py-3 text-left font-semibold">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-4 py-3">{row.source}</td>
                    <td className="px-4 py-3 font-semibold">{row.action.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.href ? (
                        <Link href={row.href} className="font-semibold text-emerald-700 underline">
                          {row.entity}
                        </Link>
                      ) : (
                        row.entity
                      )}
                      <p className="mt-1 text-xs text-slate-500">Actor: {row.actor}</p>
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-700">{row.title}</td>
                    <td className="max-w-xs px-4 py-3">
                      <pre className="max-h-28 overflow-auto rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                        {row.metadata ? JSON.stringify(row.metadata, null, 2) : "{}"}
                      </pre>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-slate-600">
                      No audit activity yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
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
