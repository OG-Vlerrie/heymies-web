export const dynamic = "force-dynamic";

import Link from "next/link";
import LeadPipelineBoard from "./LeadPipelineBoard";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type PipelineEnquiry = {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  enquiry_count: number | null;
  latest_message: string | null;
  request_viewing: boolean | null;
  readiness_score: number | null;
  property_fit_score: number | null;
  qualification_status: string | null;
  qualification_summary: string | null;
  next_action: string | null;
  nurture_status: string | null;
  next_nurture_at: string | null;
  last_nurtured_at: string | null;
  last_buyer_response: string | null;
  last_buyer_responded_at: string | null;
  agent_ready_at: string | null;
  first_enquired_at: string | null;
  last_enquired_at: string | null;
  listing?: {
    id: string;
    title: string | null;
    suburb: string | null;
    city: string | null;
    price: number | null;
    price_per_month: number | null;
    sale_type: string | null;
    cover_image: string | null;
    status: string | null;
  } | null;
};

type EventRow = {
  enquiry_id: string | null;
  event_type: string;
  created_at: string;
};

export default async function AdminPipelinePage() {
  const supabase = supabaseAdmin();

  const [enquiriesResult, eventsResult] = await Promise.all([
    supabase
      .from("enquiries")
      .select(
        "id,user_id,listing_id,full_name,email,phone,status,enquiry_count,latest_message,request_viewing,readiness_score,property_fit_score,qualification_status,qualification_summary,next_action,nurture_status,next_nurture_at,last_nurtured_at,last_buyer_response,last_buyer_responded_at,agent_ready_at,first_enquired_at,last_enquired_at,listing:listings(id,title,suburb,city,price,price_per_month,sale_type,cover_image,status)"
      )
      .order("last_enquired_at", { ascending: false })
      .limit(400),
    supabase
      .from("enquiry_events")
      .select("enquiry_id,event_type,created_at")
      .order("created_at", { ascending: false })
      .limit(800),
  ]);

  const enquiries = normalizeRows<PipelineEnquiry>(enquiriesResult.data ?? [], "listing");
  const events = ((eventsResult.data ?? []) as EventRow[]).filter((event) => event.enquiry_id);
  const eventCounts = events.reduce<Record<string, number>>((acc, event) => {
    if (!event.enquiry_id) return acc;
    acc[event.enquiry_id] = (acc[event.enquiry_id] ?? 0) + 1;
    return acc;
  }, {});

  const dueNow = enquiries.filter(
    (enquiry) =>
      enquiry.next_nurture_at &&
      new Date(enquiry.next_nurture_at).getTime() <= Date.now() &&
      ["pending", "nurturing"].includes(enquiry.nurture_status ?? "")
  ).length;
  const ready = enquiries.filter((enquiry) => enquiry.qualification_status === "agent_ready").length;
  const won = enquiries.filter((enquiry) => enquiry.status === "won").length;
  const lost = enquiries.filter((enquiry) => enquiry.status === "lost").length;

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Mia command centre</p>
            <h1 className="mt-2 text-3xl font-semibold">Lead Pipeline</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Work every enquiry by readiness, nurture stage, and outcome. Move leads forward, pause Mia,
              resume follow-ups, and open the full handover context when needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/mia" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Mia dashboard
            </Link>
            <Link href="/admin" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
              Admin home
            </Link>
          </div>
        </div>

        {enquiriesResult.error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load pipeline. {enquiriesResult.error.message}
          </div>
        ) : (
          <>
            {eventsResult.error ? (
              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Pipeline loaded, but event counts are unavailable. {eventsResult.error.message}
              </div>
            ) : null}

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Total enquiries" value={enquiries.length} tone="neutral" />
              <Metric label="Due nurture" value={dueNow} tone="warn" />
              <Metric label="Agent-ready" value={ready} tone="good" />
              <Metric label="Won / lost" value={`${won} / ${lost}`} tone="muted" />
            </section>

            <LeadPipelineBoard initialEnquiries={enquiries} eventCounts={eventCounts} />
          </>
        )}
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
  value: number | string;
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

function normalizeRows<T extends Record<string, any>>(rows: unknown[], key: string) {
  return rows.map((row) => {
    const record = row as Record<string, any>;
    return {
      ...record,
      [key]: Array.isArray(record[key]) ? record[key][0] : record[key],
    } as T;
  });
}
