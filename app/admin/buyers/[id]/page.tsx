export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

type QueryResult<T> = {
  data: T[];
  error: string | null;
};

type BuyerRow = {
  id: string;
  user_id: string;
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
  created_at: string | null;
};

type EnquiryRow = {
  id: string;
  listing_id: string | null;
  status: string | null;
  qualification_status: string | null;
  nurture_status: string | null;
  readiness_score: number | null;
  property_fit_score: number | null;
  latest_message: string | null;
  next_action: string | null;
  last_enquired_at: string | null;
  listing?: { title: string | null; suburb: string | null; city: string | null } | null;
};

type EventRow = {
  id: string;
  enquiry_id: string | null;
  event_type: string;
  message: string | null;
  created_at: string;
  enquiry?: { listing?: { title: string | null } | null } | null;
};

type MatchRow = {
  id: string;
  score: number | null;
  reasons: string[] | null;
  status: string | null;
  sent_at: string | null;
  created_at: string;
  listing?: { title: string | null; suburb: string | null; city: string | null } | null;
};

type AlertRow = {
  id: string;
  name: string | null;
  enabled: boolean | null;
  areas: string[] | null;
  property_types: string[] | null;
  max_price: number | null;
  created_at: string | null;
};

type SavedRow = {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: { title: string | null; suburb: string | null; city: string | null; status: string | null } | null;
};

type PreferenceRow = {
  marketing_emails: boolean;
  nurture_emails: boolean;
  match_alert_emails: boolean;
  unsubscribed_at: string | null;
};

export default async function AdminBuyerMemoryPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const supabase = supabaseAdmin();

  const [authResult, profileResult, buyerResult, preferencesResult] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from("profiles").select("id,full_name,phone,role").eq("id", userId).maybeSingle(),
    supabase.from("buyers").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("email_preferences")
      .select("marketing_emails,nurture_emails,match_alert_emails,unsubscribed_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const buyer = (buyerResult.data as BuyerRow | null) ?? null;
  const buyerId = buyer?.id ?? null;

  const [enquiriesResult, eventsResult, matchesResult, alertsResult, savedResult, viewingsResult] =
    await Promise.all([
      safeRows<EnquiryRow>(
        supabase
          .from("enquiries")
          .select(
            "id,listing_id,status,qualification_status,nurture_status,readiness_score,property_fit_score,latest_message,next_action,last_enquired_at,listing:listings(title,suburb,city)"
          )
          .eq("user_id", userId)
          .order("last_enquired_at", { ascending: false })
          .limit(100),
        "Enquiries"
      ),
      safeRows<EventRow>(
        supabase
          .from("enquiry_events")
          .select("id,enquiry_id,event_type,message,created_at,enquiry:enquiries(listing:listings(title))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(120),
        "Mia activity"
      ),
      safeRows<MatchRow>(
        supabase
          .from("match_events")
          .select("id,score,reasons,status,sent_at,created_at,listing:listings(title,suburb,city)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        "Match events"
      ),
      safeRows<AlertRow>(
        supabase
          .from("buyer_alerts")
          .select("id,name,enabled,areas,property_types,max_price,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        "Buyer alerts"
      ),
      buyerId
        ? safeRows<SavedRow>(
            supabase
              .from("buyer_saved")
              .select("id,listing_id,created_at,listing:listings(title,suburb,city,status)")
              .eq("buyer_id", buyerId)
              .order("created_at", { ascending: false })
              .limit(100),
            "Saved listings"
          )
        : Promise.resolve({ data: [], error: null }),
      buyerId
        ? safeRows<any>(
            supabase
              .from("buyer_viewings")
              .select("id,listing_id,scheduled_for,status,listing:listings(title,suburb,city)")
              .eq("buyer_id", buyerId)
              .order("scheduled_for", { ascending: false })
              .limit(100),
            "Viewings"
          )
        : Promise.resolve({ data: [], error: null }),
    ]);

  const warnings = [
    authResult.error ? `Auth user: ${authResult.error.message}` : null,
    profileResult.error ? `Profile: ${profileResult.error.message}` : null,
    buyerResult.error ? `Buyer profile: ${buyerResult.error.message}` : null,
    preferencesResult.error ? `Email preferences: ${preferencesResult.error.message}` : null,
    enquiriesResult.error,
    eventsResult.error,
    matchesResult.error,
    alertsResult.error,
    savedResult.error,
    viewingsResult.error,
  ].filter(Boolean) as string[];

  const authUser = authResult.data?.user;
  const profile = profileResult.data as { full_name: string | null; phone: string | null; role: string | null } | null;
  const preferences = preferencesResult.data as PreferenceRow | null;
  const enquiries = normalizeRows<EnquiryRow>(enquiriesResult.data, "listing");
  const events = normalizeRows<EventRow>(eventsResult.data, "enquiry");
  const matches = normalizeRows<MatchRow>(matchesResult.data, "listing");
  const saved = normalizeRows<SavedRow>(savedResult.data, "listing");

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin/pipeline" className="text-sm font-semibold text-emerald-700">
              Back to pipeline
            </Link>
            <p className="tech-kicker mt-6">Buyer memory</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {buyer?.full_name ?? profile?.full_name ?? authUser?.email ?? "Buyer"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Everything HeyMies and Mia know about this buyer across enquiries, alerts, matches, saved homes,
              preferences, and nurture activity.
            </p>
          </div>
          <Link href="/admin" className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
            Admin home
          </Link>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Some buyer memory data could not be loaded.</p>
            <ul className="mt-2 grid gap-1 md:grid-cols-2">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Readiness" value={`${buyer?.lead_score ?? 0}/100`} tone="good" />
          <Metric label="Enquiries" value={enquiries.length} tone="neutral" />
          <Metric label="Saved homes" value={saved.length} tone="neutral" />
          <Metric label="Match emails" value={matches.filter((match) => match.sent_at || match.status === "sent").length} tone="muted" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="What Mia Knows">
            <div className="grid gap-3">
              <Detail label="Email" value={authUser?.email ?? "-"} />
              <Detail label="Phone" value={buyer?.phone ?? profile?.phone ?? "-"} />
              <Detail label="Role" value={profile?.role ?? "-"} />
              <Detail label="Confirmed" value={authUser?.email_confirmed_at ? formatDate(authUser.email_confirmed_at) : "No"} />
              <Detail label="Budget" value={formatBudget(buyer)} />
              <Detail label="Areas" value={formatList(buyer?.areas_multi ?? buyer?.areas)} />
              <Detail label="Property types" value={formatList(buyer?.property_types)} />
              <Detail label="Beds / baths" value={`${buyer?.bedrooms_min ?? "-"} / ${buyer?.bathrooms_min ?? "-"}`} />
              <Detail label="Finance" value={buyer?.preapproved ?? "-"} />
              <Detail label="Timeline" value={buyer?.timeline ?? "-"} />
              <Detail label="Selling first" value={buyer?.selling_property ?? "-"} />
              <Detail
                label="Email preferences"
                value={
                  preferences
                    ? `Nurture ${onOff(preferences.nurture_emails)}, matches ${onOff(preferences.match_alert_emails)}${preferences.unsubscribed_at ? ", unsubscribed" : ""}`
                    : "-"
                }
              />
            </div>
          </Panel>

          <Panel title="Lead Timeline">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{event.event_type.replaceAll("_", " ")}</p>
                    <span className="text-xs text-slate-500">{formatDate(event.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {event.enquiry?.listing?.title ?? "Buyer activity"}
                  </p>
                  {event.message ? <p className="mt-2 text-sm text-slate-700">{event.message}</p> : null}
                </div>
              ))}
              {events.length === 0 ? <p className="text-sm text-slate-600">No Mia activity yet.</p> : null}
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Enquiries">
            <div className="space-y-3">
              {enquiries.map((enquiry) => (
                <Link
                  key={enquiry.id}
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="block rounded-2xl border border-slate-200 p-4 hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{enquiry.listing?.title ?? "Listing"}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {[enquiry.listing?.suburb, enquiry.listing?.city].filter(Boolean).join(", ") || "Area pending"}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {(enquiry.qualification_status ?? "-").replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>Ready {enquiry.readiness_score ?? 0}/100</span>
                    <span>Fit {enquiry.property_fit_score ?? 0}%</span>
                    <span>{enquiry.last_enquired_at ? formatDate(enquiry.last_enquired_at) : "-"}</span>
                  </div>
                  {enquiry.next_action ? <p className="mt-3 text-sm text-slate-700">{enquiry.next_action}</p> : null}
                </Link>
              ))}
              {enquiries.length === 0 ? <p className="text-sm text-slate-600">No enquiries yet.</p> : null}
            </div>
          </Panel>

          <Panel title="Matches and Alerts">
            <div className="space-y-4">
              <Subsection title="Alerts">
                {alertsResult.data.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold">{alert.name ?? "Buyer alert"}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatList(alert.areas)} / {formatList(alert.property_types)} / max {alert.max_price ? formatZar(alert.max_price) : "-"}
                    </p>
                  </div>
                ))}
                {alertsResult.data.length === 0 ? <p className="text-sm text-slate-600">No alerts yet.</p> : null}
              </Subsection>

              <Subsection title="Recent matches">
                {matches.slice(0, 10).map((match) => (
                  <div key={match.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{match.listing?.title ?? "Listing match"}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {[match.listing?.suburb, match.listing?.city].filter(Boolean).join(", ") || "Area pending"}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {match.score ?? 0}%
                      </span>
                    </div>
                    {match.reasons?.length ? <p className="mt-2 text-sm text-slate-600">{match.reasons.join(", ")}</p> : null}
                  </div>
                ))}
                {matches.length === 0 ? <p className="text-sm text-slate-600">No match events yet.</p> : null}
              </Subsection>
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Saved Homes">
            <div className="space-y-3">
              {saved.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.listing_id}`}
                  className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <p className="font-semibold">{item.listing?.title ?? "Listing"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {[item.listing?.suburb, item.listing?.city].filter(Boolean).join(", ") || "Area pending"} / {item.listing?.status ?? "-"}
                  </p>
                </Link>
              ))}
              {saved.length === 0 ? <p className="text-sm text-slate-600">No saved homes yet.</p> : null}
            </div>
          </Panel>

          <Panel title="Viewings">
            <div className="space-y-3">
              {viewingsResult.data.map((viewing: any) => (
                <div key={viewing.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold">{one(viewing.listing)?.title ?? "Viewing"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {viewing.scheduled_for ? formatDate(viewing.scheduled_for) : "-"} / {viewing.status ?? "-"}
                  </p>
                </div>
              ))}
              {viewingsResult.data.length === 0 ? <p className="text-sm text-slate-600">No viewings scheduled.</p> : null}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

async function safeRows<T>(query: PromiseLike<any>, label: string): Promise<QueryResult<T>> {
  const result = await query;
  if (result.error) return { data: [], error: `${label}: ${result.error.message}` };
  return { data: (result.data ?? []) as T[], error: null };
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "neutral" | "good" | "muted";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function normalizeRows<T extends Record<string, any>>(rows: unknown[], key: string) {
  return rows.map((row) => {
    const record = row as Record<string, any>;
    return {
      ...record,
      [key]: one(record[key]),
    } as T;
  });
}

function one<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function formatBudget(buyer: BuyerRow | null) {
  if (!buyer?.budget_min && !buyer?.budget_max) return "-";
  return `${buyer.budget_min ? formatZar(buyer.budget_min) : "Any"} to ${buyer.budget_max ? formatZar(buyer.budget_max) : "Any"}`;
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

function onOff(value: boolean) {
  return value ? "on" : "off";
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
