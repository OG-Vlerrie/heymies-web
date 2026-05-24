"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { scoreListingForBuyer, type BuyerMatchProfile } from "@/lib/matching";

type Role = "agent" | "seller" | "buyer" | "admin";

type EnquiryLead = {
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
    suburb: string | null;
    city: string | null;
    cover_image: string | null;
    price: number | null;
    price_per_month: number | null;
    sale_type: string | null;
    listing_type: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    status: string;
  };
};

type BuyerLeadProfile = BuyerMatchProfile & {
  user_id: string;
  lead_score: number | null;
  preapproved: string | null;
  timeline: string | null;
};

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatListingPrice(listing?: EnquiryLead["listing"]) {
  if (!listing) return "—";

  if (listing.sale_type === "rent") {
    return listing.price_per_month
      ? `${formatZAR(listing.price_per_month)} / month`
      : "—";
  }

  return listing.price !== null ? formatZAR(listing.price) : "—";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function DashboardLeadsPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
  const [buyersByUserId, setBuyersByUserId] = useState<Record<string, BuyerLeadProfile>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;

      if (!user) {
        router.push("/login?next=/dashboard/leads");
        return;
      }

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (pErr || !profile) {
        setError(pErr?.message ?? "Profile missing");
        setLoading(false);
        return;
      }

      if (profile.role === "buyer") {
        router.push("/dashboard");
        return;
      }

      setRole(profile.role as Role);

      const { data, error: lErr } = await supabase
        .from("enquiries")
        .select(
          "id, user_id, full_name, email, phone, status, enquiry_count, latest_message, request_viewing, property_fit_score, readiness_score, qualification_status, qualification_summary, next_action, first_enquired_at, last_enquired_at, listing_id, listing:listings(id,title,suburb,city,cover_image,price,price_per_month,sale_type,listing_type,bedrooms,bathrooms,status)"
        )
        .eq("agent_id", user.id)
        .order("last_enquired_at", { ascending: false })
        .limit(200);

      if (lErr) {
        setError(lErr.message);
        setLeads([]);
        setLoading(false);
        return;
      }

      const nextLeads = (data ?? []).map((row) => ({
          ...row,
          listing: oneRelated(row.listing),
        })) as EnquiryLead[];

      setLeads(nextLeads);

      const buyerUserIds = Array.from(
        new Set(nextLeads.map((lead) => lead.user_id).filter(Boolean))
      ) as string[];

      if (buyerUserIds.length > 0) {
        const { data: buyerRows } = await supabase
          .from("buyers")
          .select(
            "user_id,lead_score,preapproved,timeline,budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min"
          )
          .in("user_id", buyerUserIds);

        setBuyersByUserId(
          Object.fromEntries(
            ((buyerRows ?? []) as BuyerLeadProfile[]).map((buyer) => [buyer.user_id, buyer])
          )
        );
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  const filtered = leads.filter((l) => {
    const hay = [
      l.full_name ?? "",
      l.email ?? "",
      l.phone ?? "",
      l.latest_message ?? "",
      l.listing?.title ?? "",
      l.listing?.suburb ?? "",
      l.listing?.city ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return hay.includes(q.trim().toLowerCase());
  });

  if (loading) {
    return <main className="tech-page mx-auto max-w-6xl p-6">Loading enquiries...</main>;
  }

  return (
    <main className="tech-page">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Property Enquiries
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {role === "agent" ? "Agent" : "Private Seller"} enquiries assigned to you
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="Search buyer, listing, area, message…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {filtered.length} enquir{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                No enquiries assigned yet
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                New enquiries will appear here with readiness, property fit, bond
                status, timeline, and viewing intent so you can prioritise faster.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <QualityPill label="Readiness score" tone="good" />
                <QualityPill label="Property fit" tone="warn" />
                <QualityPill label="Viewing intent" tone="neutral" />
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((l) => {
                const buyer = l.user_id ? buyersByUserId[l.user_id] : null;
                const fit =
                  l.property_fit_score !== null && l.property_fit_score !== undefined
                    ? { score: l.property_fit_score, reasons: [] }
                    : buyer && l.listing
                    ? scoreListingForBuyer(
                        {
                          id: l.listing.id,
                          title: l.listing.title,
                          price: l.listing.price,
                          price_per_month: l.listing.price_per_month,
                          sale_type: l.listing.sale_type,
                          listing_type: l.listing.listing_type,
                          suburb: l.listing.suburb,
                          city: l.listing.city,
                          bedrooms: l.listing.bedrooms,
                          bathrooms: l.listing.bathrooms,
                        },
                        buyer
                      )
                    : null;
                const readiness = l.readiness_score ?? buyer?.lead_score ?? null;

                return (
                <li key={l.id} className="p-4 hover:bg-slate-50">
                  <Link href={`/dashboard/leads/${l.id}`} className="block">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {l.full_name ?? l.email ?? l.phone ?? "Unnamed enquiry"}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {l.email ?? "—"} • {l.phone ?? "—"}
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-800">
                          {l.listing?.title ?? "Listing"}{" "}
                          <span className="font-normal text-slate-500">
                            • {[l.listing?.suburb, l.listing?.city].filter(Boolean).join(", ")}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {formatListingPrice(l.listing)}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {l.latest_message ?? "No message provided."}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Last activity {formatDate(l.last_enquired_at)}</span>
                          <span>•</span>
                          <span>
                            {l.enquiry_count} enquir{l.enquiry_count === 1 ? "y" : "ies"}
                          </span>
                          {l.request_viewing ? (
                            <>
                              <span>•</span>
                              <span>Viewing requested</span>
                            </>
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {l.qualification_status ? (
                            <QualityPill
                              label={qualificationLabel(l.qualification_status)}
                              tone={l.qualification_status === "agent_ready" ? "good" : "neutral"}
                            />
                          ) : null}
                          <QualityPill
                            label={
                              readiness !== null && readiness !== undefined
                                ? `Readiness ${readiness}/100`
                                : "Readiness unknown"
                            }
                            tone={
                              (readiness ?? 0) >= 70
                                ? "good"
                                : (readiness ?? 0) >= 45
                                ? "warn"
                                : "neutral"
                            }
                          />
                          <QualityPill
                            label={fit ? `Property fit ${fit.score}%` : "Fit pending"}
                            tone={fit && fit.score >= 70 ? "good" : fit && fit.score >= 45 ? "warn" : "neutral"}
                          />
                          {buyer?.preapproved ? (
                            <QualityPill
                              label={`Bond: ${buyer.preapproved}`}
                              tone={buyer.preapproved === "Yes" ? "good" : "neutral"}
                            />
                          ) : null}
                          {buyer?.timeline ? (
                            <QualityPill label={buyer.timeline} tone="neutral" />
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <StatusPill status={l.status} />
                        <span className="text-xs text-slate-500">
                          {l.qualification_status === "agent_ready"
                            ? "Handover ready"
                            : `Intent: ${l.request_viewing || l.enquiry_count > 1 ? "High" : "New"}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
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

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const base = "rounded-full border px-3 py-1 text-xs font-medium";

  if (s === "new")
    return (
      <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}>
        New
      </span>
    );
  if (s === "active" || s === "contacted")
    return (
      <span className={`${base} border-blue-200 bg-blue-50 text-blue-800`}>
        Active
      </span>
    );
  if (s === "qualified")
    return (
      <span className={`${base} border-violet-200 bg-violet-50 text-violet-800`}>
        Qualified
      </span>
    );
  if (s === "nurture")
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        Nurture
      </span>
    );
  if (s === "viewing" || s === "viewing scheduled")
    return (
      <span className={`${base} border-slate-200 bg-slate-50 text-slate-800`}>
        Viewing
      </span>
    );
  if (s === "offer")
    return (
      <span className={`${base} border-slate-200 bg-slate-50 text-slate-800`}>
        Offer
      </span>
    );
  if (s === "won")
    return (
      <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}>
        Won
      </span>
    );
  if (s === "lost")
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        Lost
      </span>
    );

  return (
    <span className={`${base} border-slate-200 bg-white text-slate-700`}>
      {status}
    </span>
  );
}
