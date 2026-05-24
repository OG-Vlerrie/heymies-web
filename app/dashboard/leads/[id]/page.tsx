"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { scoreListingForBuyer, type BuyerMatchProfile, type ListingMatch } from "@/lib/matching";

type Enquiry = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  enquiry_count: number;
  latest_message: string | null;
  request_viewing: boolean;
  property_fit_score: number | null;
  readiness_score: number | null;
  qualification_status: string | null;
  qualification_summary: string | null;
  next_action: string | null;
  first_enquired_at: string;
  last_enquired_at: string;
  listing_id: string;
  listing?: {
    id: string;
    title: string;
    price: number | null;
    price_per_month: number | null;
    sale_type: string | null;
    listing_type: string | null;
    suburb: string | null;
    city: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    cover_image: string | null;
    status: string | null;
  };
};

type BuyerProfile = BuyerMatchProfile & {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  lead_score: number | null;
  preapproved: string | null;
  timeline: string | null;
  selling_property: string | null;
};

function oneRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function qualificationLabel(status: string) {
  switch (status) {
    case "agent_ready":
      return "Agent-ready";
    case "needs_finance_nurture":
      return "Finance nurture";
    case "needs_confirmation":
      return "Needs confirmation";
    case "nurture_for_better_fit":
      return "Better-fit nurture";
    case "not_ready":
      return "Not ready";
    default:
      return status.replaceAll("_", " ");
  }
}

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPrice(listing?: Enquiry["listing"]) {
  if (!listing) return "-";
  if (listing.sale_type === "rent") {
    return listing.price_per_month ? `${formatZAR(listing.price_per_month)} / month` : "-";
  }
  return listing.price !== null ? formatZAR(listing.price) : "-";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [fit, setFit] = useState<ListingMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLead() {
    setError(null);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (!user) {
      router.push("/login?next=/dashboard/leads");
      return;
    }

    const leadId = params?.id as string;
    const { data, error: enquiryErr } = await supabase
      .from("enquiries")
      .select(
        "id,user_id,full_name,email,phone,status,enquiry_count,latest_message,request_viewing,property_fit_score,readiness_score,qualification_status,qualification_summary,next_action,first_enquired_at,last_enquired_at,listing_id, listing:listings(id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,cover_image,status)"
      )
      .eq("id", leadId)
      .eq("agent_id", user.id)
      .single();

    if (enquiryErr || !data) {
      setError(enquiryErr?.message ?? "Enquiry not found.");
      setLoading(false);
      return;
    }

    const nextEnquiry = {
      ...data,
      listing: oneRelated(data.listing),
    } as Enquiry;

    setEnquiry(nextEnquiry);

    if (nextEnquiry.user_id) {
      const { data: buyerRow } = await supabase
        .from("buyers")
        .select(
          "user_id,full_name,phone,lead_score,preapproved,timeline,selling_property,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min"
        )
        .eq("user_id", nextEnquiry.user_id)
        .maybeSingle();

      const nextBuyer = (buyerRow as BuyerProfile | null) ?? null;
      setBuyer(nextBuyer);

      if (nextBuyer && nextEnquiry.listing) {
        setFit(
          nextEnquiry.property_fit_score !== null &&
            nextEnquiry.property_fit_score !== undefined
            ? { score: nextEnquiry.property_fit_score, reasons: [] }
            : scoreListingForBuyer(nextEnquiry.listing, nextBuyer)
        );
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  async function updateStatus(status: string) {
    if (!enquiry) return;
    setSaving(true);
    const { error: updateErr } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", enquiry.id);

    if (updateErr) setError(updateErr.message);
    else setEnquiry({ ...enquiry, status });
    setSaving(false);
  }

  if (loading) {
    return <main className="tech-page mx-auto max-w-6xl p-6">Loading lead...</main>;
  }

  return (
    <main className="tech-page">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="tech-kicker">Lead intelligence</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {enquiry?.full_name ?? enquiry?.email ?? "Enquiry"}
            </h1>
            {enquiry ? (
              <p className="mt-1 text-sm text-slate-600">
                First enquiry {formatDate(enquiry.first_enquired_at)} / Last activity{" "}
                {formatDate(enquiry.last_enquired_at)}
              </p>
            ) : null}
          </div>

          <Link
            href="/dashboard/leads"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {enquiry ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className="tech-card rounded-3xl p-6 lg:col-span-2">
              <div className="flex flex-col gap-5 md:flex-row">
                {enquiry.listing?.cover_image ? (
                  <img
                    src={enquiry.listing.cover_image}
                    alt={enquiry.listing.title}
                    className="h-44 w-full rounded-2xl object-cover md:w-64"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-50 text-xs text-slate-500 md:w-64">
                    No photo
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold">{enquiry.listing?.title ?? "Listing"}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {[enquiry.listing?.suburb, enquiry.listing?.city].filter(Boolean).join(", ") ||
                      "Location not specified"}
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{formatPrice(enquiry.listing)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <QualityPill label={`Status: ${enquiry.status}`} tone="neutral" />
                    {enquiry.qualification_status ? (
                      <QualityPill
                        label={qualificationLabel(enquiry.qualification_status)}
                        tone={enquiry.qualification_status === "agent_ready" ? "good" : "neutral"}
                      />
                    ) : null}
                    <QualityPill
                      label={enquiry.request_viewing ? "Viewing requested" : "Info requested"}
                      tone={enquiry.request_viewing ? "good" : "neutral"}
                    />
                    <QualityPill
                      label={`${enquiry.enquiry_count} enquiry${enquiry.enquiry_count === 1 ? "" : "ies"}`}
                      tone={enquiry.enquiry_count > 1 ? "good" : "neutral"}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold">Latest message</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {enquiry.latest_message ?? "No message provided."}
                </p>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="tech-card rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Buyer readiness</h2>
                <div className="mt-4 space-y-3">
                  <Metric label="Readiness score" value={`${enquiry.readiness_score ?? buyer?.lead_score ?? 0}/100`} />
                  <Metric label="Property fit" value={fit ? `${fit.score}%` : "Pending"} />
                  <Metric label="Bond status" value={buyer?.preapproved ?? "-"} />
                  <Metric label="Timeline" value={buyer?.timeline ?? "-"} />
                  <Metric label="Needs to sell first" value={buyer?.selling_property ?? "-"} />
                </div>
                {fit ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {fit.reasons.map((reason) => (
                      <QualityPill key={reason} label={reason} tone="good" />
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="tech-card rounded-3xl p-6">
                <h2 className="text-lg font-semibold">HeyMies qualification</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Metric label="Summary" value={enquiry.qualification_summary ?? "Pending"} />
                  <Metric label="Next action" value={enquiry.next_action ?? "Review manually"} />
                </div>
              </section>

              <section className="tech-card rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Contact</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Metric label="Name" value={enquiry.full_name ?? buyer?.full_name ?? "-"} />
                  <Metric label="Email" value={enquiry.email ?? "-"} />
                  <Metric label="Phone" value={enquiry.phone ?? buyer?.phone ?? "-"} />
                </div>
              </section>

              <section className="tech-card rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Next action</h2>
                <div className="mt-4 grid gap-2">
                  {["contacted", "qualified", "viewing", "offer", "won", "lost"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(status)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QualityPill({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "warn" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}
