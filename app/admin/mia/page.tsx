export const dynamic = "force-dynamic";

import Link from "next/link";
import MiaRunButton from "./MiaRunButton";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Enquiry = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  qualification_status: string | null;
  nurture_status: string | null;
  readiness_score: number | null;
  property_fit_score: number | null;
  qualification_summary: string | null;
  next_action: string | null;
  last_nurtured_at: string | null;
  next_nurture_at: string | null;
  last_buyer_response: string | null;
  last_buyer_responded_at: string | null;
  agent_ready_at: string | null;
  last_enquired_at: string | null;
  listing?: {
    title: string | null;
    suburb: string | null;
    city: string | null;
  } | null;
};

type EventRow = {
  id: string;
  event_type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  enquiry?: {
    full_name: string | null;
    email: string | null;
    listing?: {
      title: string | null;
    } | null;
  } | null;
};

type MatchEvent = {
  id: string;
  score: number | null;
  status: string | null;
  sent_at: string | null;
  created_at: string;
  listing?: { title: string | null } | null;
};

type EmailPreference = {
  id: string;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

export default async function MiaAdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="tech-page text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <BackLink />
          <h1 className="mt-6 text-3xl font-semibold">Mia Dashboard</h1>
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Supabase admin environment variables are not configured.
          </div>
        </div>
      </main>
    );
  }

  const supabase = supabaseAdmin();

  const [enquiriesResult, eventsResult, matchesResult, preferencesResult] =
    await Promise.all([
      supabase
        .from("enquiries")
        .select(
          "id,full_name,email,phone,status,qualification_status,nurture_status,readiness_score,property_fit_score,qualification_summary,next_action,last_nurtured_at,next_nurture_at,last_buyer_response,last_buyer_responded_at,agent_ready_at,last_enquired_at,listing:listings(title,suburb,city)"
        )
        .order("last_enquired_at", { ascending: false })
        .limit(250),
      supabase
        .from("enquiry_events")
        .select(
          "id,event_type,message,metadata,created_at,enquiry:enquiries(full_name,email,listing:listings(title))"
        )
        .in("event_type", ["nurture_sent", "buyer_response", "nurture_paused", "created", "updated"])
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("match_events")
        .select("id,score,status,sent_at,created_at,listing:listings(title)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("email_preferences")
        .select("id,nurture_emails,match_alert_emails,unsubscribed_at")
        .limit(1000),
    ]);

  const error = enquiriesResult.error?.message ?? null;
  const warnings = [
    eventsResult.error ? `Activity unavailable: ${eventsResult.error.message}` : null,
    matchesResult.error ? `Match emails unavailable: ${matchesResult.error.message}` : null,
    preferencesResult.error ? `Email preferences unavailable: ${preferencesResult.error.message}` : null,
  ].filter(Boolean) as string[];

  const enquiries = normalizeRows<Enquiry>(enquiriesResult.data ?? [], "listing");
  const events = eventsResult.error
    ? []
    : normalizeRows<EventRow>(eventsResult.data ?? [], "enquiry");
  const matches = matchesResult.error
    ? []
    : normalizeRows<MatchEvent>(matchesResult.data ?? [], "listing");
  const preferences = preferencesResult.error
    ? []
    : ((preferencesResult.data ?? []) as EmailPreference[]);

  const now = Date.now();
  const dueNurture = enquiries.filter(
    (enquiry) =>
      enquiry.next_nurture_at &&
      new Date(enquiry.next_nurture_at).getTime() <= now &&
      ["nurturing", "pending"].includes(enquiry.nurture_status ?? "")
  );
  const agentReady = enquiries.filter((enquiry) => enquiry.qualification_status === "agent_ready");
  const nurturing = enquiries.filter((enquiry) => enquiry.nurture_status === "nurturing");
  const paused = enquiries.filter((enquiry) => enquiry.nurture_status === "paused");
  const buyerResponses = events.filter((event) => event.event_type === "buyer_response");
  const nurtureSent = events.filter((event) => event.event_type === "nurture_sent");
  const sentMatches = matches.filter((match) => match.status === "sent" || match.sent_at);
  const unsubscribed = preferences.filter((preference) => preference.unsubscribed_at);

  if (error) {
    return (
      <main className="tech-page text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <BackLink />
          <h1 className="mt-6 text-3xl font-semibold">Mia Dashboard</h1>
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load Mia data. {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Master admin</p>
            <h1 className="mt-2 text-3xl font-semibold">Mia Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor automated nurture, buyer responses, agent-ready handovers, match emails, and paused follow-ups.
            </p>
          </div>
          <Link
            href="/admin"
            className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Admin home
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Due nurture" value={dueNurture.length} tone="warn" />
          <Metric label="Agent-ready" value={agentReady.length} tone="good" />
          <Metric label="Nurturing" value={nurturing.length} tone="neutral" />
          <Metric label="Paused" value={paused.length} tone="muted" />
        </section>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some Mia data could not be loaded.</p>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Buyer responses" value={buyerResponses.length} tone="good" />
          <Metric label="Mia emails sent" value={nurtureSent.length} tone="neutral" />
          <Metric label="Match emails sent" value={sentMatches.length} tone="neutral" />
          <Metric label="Unsubscribed" value={unsubscribed.length} tone="muted" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <MiaRunButton />
          <Panel title="Due Now" subtitle="Enquiries Mia should follow up next.">
            <EnquiryList enquiries={dueNurture.slice(0, 8)} empty="No due nurture right now." />
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Agent-Ready Leads" subtitle="Buyers ready for agent handover.">
            <EnquiryList enquiries={agentReady.slice(0, 10)} empty="No agent-ready leads yet." />
          </Panel>

          <Panel title="Recent Mia Activity" subtitle="Nurture emails, buyer clicks, and paused follow-ups.">
            <EventList events={events.slice(0, 12)} />
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Paused Nurture" subtitle="Leads Mia stopped contacting after the follow-up cap.">
            <EnquiryList enquiries={paused.slice(0, 10)} empty="No paused nurture leads." />
          </Panel>

          <Panel title="Recent Match Emails" subtitle="Buyer alert matches generated by new or active listings.">
            <MatchList matches={matches.slice(0, 12)} />
          </Panel>
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
  tone: "good" | "warn" | "neutral" | "muted";
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

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function EnquiryList({ enquiries, empty }: { enquiries: Enquiry[]; empty: string }) {
  if (enquiries.length === 0) return <p className="text-sm text-slate-600">{empty}</p>;

  return (
    <div className="space-y-3">
      {enquiries.map((enquiry) => (
        <Link
          key={enquiry.id}
          href={`/admin/enquiries/${enquiry.id}`}
          className="block rounded-2xl border border-slate-200 p-4 hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{enquiry.full_name || enquiry.email || "Unnamed buyer"}</p>
              <p className="mt-1 text-sm text-slate-600">
                {enquiry.listing?.title ?? "Listing"} /{" "}
                {[enquiry.listing?.suburb, enquiry.listing?.city].filter(Boolean).join(", ") || "Location pending"}
              </p>
            </div>
            <StatusPill status={enquiry.qualification_status ?? enquiry.nurture_status ?? "unknown"} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            <span>Readiness {enquiry.readiness_score ?? "-"}/100</span>
            <span>Fit {enquiry.property_fit_score ?? "-"}%</span>
            {enquiry.next_nurture_at ? <span>Next {formatDate(enquiry.next_nurture_at)}</span> : null}
          </div>
          {enquiry.next_action ? (
            <p className="mt-3 text-sm text-slate-700">{enquiry.next_action}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function EventList({ events }: { events: EventRow[] }) {
  if (events.length === 0) return <p className="text-sm text-slate-600">No Mia activity yet.</p>;

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{labelEvent(event.event_type)}</p>
            <span className="text-xs text-slate-500">{formatDate(event.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {event.enquiry?.full_name || event.enquiry?.email || "Buyer"} /{" "}
            {event.enquiry?.listing?.title ?? "Listing"}
          </p>
          {event.message ? <p className="mt-2 text-sm text-slate-700">{event.message}</p> : null}
        </div>
      ))}
    </div>
  );
}

function MatchList({ matches }: { matches: MatchEvent[] }) {
  if (matches.length === 0) return <p className="text-sm text-slate-600">No match emails yet.</p>;

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{match.listing?.title ?? "Listing match"}</p>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {match.score ?? "-"}%
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {match.status ?? "pending"} / {formatDate(match.sent_at ?? match.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function labelEvent(type: string) {
  if (type === "nurture_sent") return "Mia email sent";
  if (type === "buyer_response") return "Buyer clicked reply";
  if (type === "nurture_paused") return "Nurture paused";
  if (type === "created") return "Enquiry created";
  if (type === "updated") return "Enquiry updated";
  return type.replaceAll("_", " ");
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
