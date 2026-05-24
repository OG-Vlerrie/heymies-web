export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminEnquiryActions from "./AdminEnquiryActions";
import AdminHandoverPack from "./AdminHandoverPack";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Enquiry = {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  agent_id: string | null;
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
    price: number | null;
    price_per_month: number | null;
    sale_type: string | null;
    listing_type: string | null;
    suburb: string | null;
    city: string | null;
    province: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    cover_image: string | null;
    status: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
  } | null;
};

type Buyer = {
  full_name: string | null;
  phone: string | null;
  budget_min: number | null;
  budget_max: number | null;
  property_types: string[] | null;
  areas: string[] | null;
  areas_multi: string[] | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  preapproved: string | null;
  timeline: string | null;
  selling_property: string | null;
  lead_score: number | null;
};

type EventRow = {
  id: string;
  event_type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type PreferenceRow = {
  marketing_emails: boolean;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

export default async function AdminEnquiryDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "id,user_id,listing_id,agent_id,full_name,email,phone,status,enquiry_count,latest_message,request_viewing,readiness_score,property_fit_score,qualification_status,qualification_summary,next_action,nurture_status,next_nurture_at,last_nurtured_at,last_buyer_response,last_buyer_responded_at,agent_ready_at,first_enquired_at,last_enquired_at,listing:listings(id,title,price,price_per_month,sale_type,listing_type,suburb,city,province,bedrooms,bathrooms,cover_image,status,contact_name,contact_email,contact_phone)"
    )
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <main className="tech-page text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <BackLink />
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load enquiry. {error?.message ?? "Not found."}
          </div>
        </div>
      </main>
    );
  }

  const enquiry = normalizeRelation(data as unknown as Enquiry, "listing");

  const [buyerResult, eventsResult, preferenceResult, agentResult] = await Promise.all([
    enquiry.user_id
      ? supabase
          .from("buyers")
          .select(
            "full_name,phone,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min,preapproved,timeline,selling_property,lead_score"
          )
          .eq("user_id", enquiry.user_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("enquiry_events")
      .select("id,event_type,message,metadata,created_at")
      .eq("enquiry_id", enquiry.id)
      .order("created_at", { ascending: false })
      .limit(50),
    enquiry.user_id
      ? supabase
          .from("email_preferences")
          .select("marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
          .eq("user_id", enquiry.user_id)
          .maybeSingle()
      : enquiry.email
        ? supabase
            .from("email_preferences")
            .select("marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
            .ilike("email", enquiry.email)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    enquiry.agent_id
      ? supabase.from("profiles").select("id,full_name,phone,role").eq("id", enquiry.agent_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const buyer = (buyerResult.data as Buyer | null) ?? null;
  const events = ((eventsResult.data ?? []) as EventRow[]) ?? [];
  const preference = (preferenceResult.data as PreferenceRow | null) ?? null;
  const agent = (agentResult.data as ProfileRow | null) ?? null;

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Mia lead detail</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {enquiry.full_name ?? enquiry.email ?? "Buyer enquiry"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Full context for the enquiry, buyer profile, listing fit, Mia activity, and manual admin decisions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/pipeline"
              className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Lead pipeline
            </Link>
            <Link
              href="/admin/mia"
              className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Mia dashboard
            </Link>
            <Link
              href="/admin"
              className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Admin home
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Readiness" value={`${enquiry.readiness_score ?? buyer?.lead_score ?? 0}/100`} tone="good" />
          <Metric label="Property fit" value={`${enquiry.property_fit_score ?? 0}%`} tone="neutral" />
          <Metric label="Enquiries" value={String(enquiry.enquiry_count ?? 1)} tone="neutral" />
          <Metric
            label="Mia nurture"
            value={(enquiry.nurture_status ?? "pending").replaceAll("_", " ")}
            tone={enquiry.nurture_status === "paused" ? "warn" : "muted"}
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row">
                {enquiry.listing?.cover_image ? (
                  <img
                    src={enquiry.listing.cover_image}
                    alt={enquiry.listing.title ?? "Listing"}
                    className="h-48 w-full rounded-2xl object-cover md:w-72"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 md:w-72">
                    No photo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{enquiry.listing?.title ?? "Listing"}</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {[enquiry.listing?.suburb, enquiry.listing?.city, enquiry.listing?.province]
                          .filter(Boolean)
                          .join(", ") || "Location pending"}
                      </p>
                    </div>
                    <StatusPill status={enquiry.qualification_status ?? "needs_confirmation"} />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{formatPrice(enquiry)}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <InfoPill>{enquiry.listing?.listing_type ?? "property"}</InfoPill>
                    <InfoPill>{enquiry.listing?.status ?? "listing status pending"}</InfoPill>
                    <InfoPill>{enquiry.request_viewing ? "Viewing requested" : "Information requested"}</InfoPill>
                    <InfoPill>
                      {enquiry.listing?.bedrooms ?? "-"} bed / {enquiry.listing?.bathrooms ?? "-"} bath
                    </InfoPill>
                  </div>
                  {enquiry.listing_id ? (
                    <Link
                      href={`/listings/${enquiry.listing_id}`}
                      className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Open public listing
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Buyer Message</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {enquiry.latest_message ?? "No message provided."}
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Mia Qualification</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Detail label="Qualification status" value={enquiry.qualification_status ?? "-"} />
                <Detail label="Lead status" value={enquiry.status ?? "-"} />
                <Detail label="Next nurture" value={enquiry.next_nurture_at ? formatDate(enquiry.next_nurture_at) : "-"} />
                <Detail label="Last nurtured" value={enquiry.last_nurtured_at ? formatDate(enquiry.last_nurtured_at) : "-"} />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Detail label="Summary" value={enquiry.qualification_summary ?? "Pending"} />
                <Detail label="Next action" value={enquiry.next_action ?? "Review manually"} />
              </div>
              {enquiry.last_buyer_response ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Buyer response: {enquiry.last_buyer_response}
                  {enquiry.last_buyer_responded_at ? ` on ${formatDate(enquiry.last_buyer_responded_at)}` : ""}
                </div>
              ) : null}
            </section>

            <AdminHandoverPack pack={buildHandoverPack({ enquiry, buyer, agent })} />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Mia Activity</h2>
              {eventsResult.error ? (
                <p className="mt-4 text-sm text-red-700">Could not load activity. {eventsResult.error.message}</p>
              ) : events.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No activity yet.</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {events.map((event) => (
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
            </section>
          </div>

          <aside className="space-y-6">
            <AdminEnquiryActions
              enquiryId={enquiry.id}
              initialStatus={enquiry.status}
              initialQualificationStatus={enquiry.qualification_status}
              initialNurtureStatus={enquiry.nurture_status}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Buyer Profile</h2>
              {enquiry.user_id ? (
                <Link
                  href={`/admin/buyers/${enquiry.user_id}`}
                  className="mt-2 inline-flex text-sm font-semibold text-emerald-700"
                >
                  Open buyer memory
                </Link>
              ) : null}
              <div className="mt-5 space-y-3">
                <Detail label="Name" value={enquiry.full_name ?? buyer?.full_name ?? "-"} />
                <Detail label="Email" value={enquiry.email ?? "-"} />
                <Detail label="Phone" value={enquiry.phone ?? buyer?.phone ?? "-"} />
                <Detail label="Budget" value={formatBudget(buyer)} />
                <Detail label="Areas" value={formatList(buyer?.areas_multi ?? buyer?.areas)} />
                <Detail label="Types" value={formatList(buyer?.property_types)} />
                <Detail label="Beds / baths" value={`${buyer?.bedrooms_min ?? "-"} / ${buyer?.bathrooms_min ?? "-"}`} />
                <Detail label="Bond status" value={buyer?.preapproved ?? "-"} />
                <Detail label="Timeline" value={buyer?.timeline ?? "-"} />
                <Detail label="Selling first" value={buyer?.selling_property ?? "-"} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Owner / Agent</h2>
              <div className="mt-5 space-y-3">
                <Detail label="Assigned profile" value={agent?.full_name ?? enquiry.agent_id ?? "-"} />
                <Detail label="Role" value={agent?.role ?? "-"} />
                <Detail label="Profile phone" value={agent?.phone ?? "-"} />
                <Detail label="Listing contact" value={enquiry.listing?.contact_name ?? "-"} />
                <Detail label="Contact email" value={enquiry.listing?.contact_email ?? "-"} />
                <Detail label="Contact phone" value={enquiry.listing?.contact_phone ?? "-"} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Email Preference</h2>
              <div className="mt-5 space-y-3">
                <Detail label="Marketing" value={formatBool(preference?.marketing_emails)} />
                <Detail label="Mia nurture" value={formatBool(preference?.nurture_emails)} />
                <Detail label="Match alerts" value={formatBool(preference?.match_alert_emails)} />
                <Detail
                  label="Unsubscribed"
                  value={preference?.unsubscribed_at ? formatDate(preference.unsubscribed_at) : "No"}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link href="/admin/mia" className="text-sm font-semibold text-emerald-700">
      Back to Mia dashboard
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "neutral" | "warn" | "muted";
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
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "agent_ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "not_ready"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
      {children}
    </span>
  );
}

function formatPrice(enquiry: Enquiry) {
  const listing = enquiry.listing;
  if (!listing) return "-";
  const value = listing.sale_type === "rent" ? listing.price_per_month : listing.price;
  if (value == null) return "-";
  const formatted = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
  return listing.sale_type === "rent" ? `${formatted} / month` : formatted;
}

function formatBudget(buyer: Buyer | null) {
  if (!buyer?.budget_min && !buyer?.budget_max) return "-";
  const min = buyer.budget_min ? formatZar(buyer.budget_min) : "Any";
  const max = buyer.budget_max ? formatZar(buyer.budget_max) : "Any";
  return `${min} to ${max}`;
}

function formatZar(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatList(values: string[] | null | undefined) {
  if (!values || values.length === 0) return "-";
  return values.join(", ");
}

function formatBool(value: boolean | undefined) {
  if (value === undefined) return "-";
  return value ? "On" : "Off";
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

function normalizeRelation<T extends Record<string, any>>(row: T, key: string) {
  return {
    ...row,
    [key]: Array.isArray(row[key]) ? row[key][0] : row[key],
  } as T;
}

function buildHandoverPack({
  enquiry,
  buyer,
  agent,
}: {
  enquiry: Enquiry;
  buyer: Buyer | null;
  agent: ProfileRow | null;
}) {
  const lines = [
    "HEYMIES AGENT HANDOVER",
    "",
    `Buyer: ${enquiry.full_name ?? buyer?.full_name ?? "-"}`,
    `Email: ${enquiry.email ?? "-"}`,
    `Phone: ${enquiry.phone ?? buyer?.phone ?? "-"}`,
    "",
    `Listing: ${enquiry.listing?.title ?? "-"}`,
    `Area: ${[enquiry.listing?.suburb, enquiry.listing?.city, enquiry.listing?.province].filter(Boolean).join(", ") || "-"}`,
    `Price: ${formatPrice(enquiry)}`,
    `Listing status: ${enquiry.listing?.status ?? "-"}`,
    "",
    `Readiness: ${enquiry.readiness_score ?? buyer?.lead_score ?? 0}/100`,
    `Property fit: ${enquiry.property_fit_score ?? 0}%`,
    `Qualification: ${enquiry.qualification_status ?? "-"}`,
    `Viewing requested: ${enquiry.request_viewing ? "Yes" : "No"}`,
    `Enquiry count: ${enquiry.enquiry_count ?? 1}`,
    "",
    `Mia read: ${enquiry.qualification_summary ?? "Pending"}`,
    `Recommended next action: ${enquiry.next_action ?? "Review manually"}`,
    "",
    "Buyer profile",
    `Budget: ${formatBudget(buyer)}`,
    `Areas: ${formatList(buyer?.areas_multi ?? buyer?.areas)}`,
    `Property types: ${formatList(buyer?.property_types)}`,
    `Minimum beds/baths: ${buyer?.bedrooms_min ?? "-"} / ${buyer?.bathrooms_min ?? "-"}`,
    `Finance: ${buyer?.preapproved ?? "-"}`,
    `Timeline: ${buyer?.timeline ?? "-"}`,
    `Needs to sell first: ${buyer?.selling_property ?? "-"}`,
    "",
    "Latest buyer message",
    enquiry.latest_message ?? "No message provided.",
    "",
    "Assigned owner/agent",
    `Profile: ${agent?.full_name ?? enquiry.agent_id ?? "-"}`,
    `Listing contact: ${enquiry.listing?.contact_name ?? "-"}`,
    `Contact email: ${enquiry.listing?.contact_email ?? "-"}`,
    `Contact phone: ${enquiry.listing?.contact_phone ?? "-"}`,
  ];

  return lines.join("\n");
}
