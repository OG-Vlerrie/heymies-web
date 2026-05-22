"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import CompareListingButton from "@/components/listings/CompareListingButton";
import SaveListingButton from "@/components/listings/SaveListingButton";
import {
  scoreListingForBuyer,
  type ListingMatch,
  type MatchListing,
} from "@/lib/matching";

/* ----------------------------- Types ----------------------------- */

type Buyer = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;

  budget_min: number | null;
  budget_max: number | null;

  property_types: string[] | null;
  areas: string[] | null;
  areas_multi?: string[] | null;

  bedrooms_min: number | null;
  bathrooms_min: number | null;

  preapproved: string | null;
  timeline: string | null;
  selling_property: string | null;

  lead_score: number | null;
  created_at?: string | null;
};

type SavedItem = {
  id: string;
  buyer_id: string;
  listing_id: string;
  created_at: string;
  listing?: {
    id: string;
    title: string;
    price: number | null;
    suburb: string | null;
    city: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    cover_image: string | null;
    status: string;
  };
};

type Enquiry = {
  id: string;
  user_id: string;
  listing_id: string;
  status: string;
  latest_message: string | null;
  enquiry_count: number;
  request_viewing: boolean;
  first_enquired_at: string;
  last_enquired_at: string;
  listing?: {
    id: string;
    title: string;
    price: number | null;
    price_per_month: number | null;
    suburb: string | null;
    city: string | null;
    cover_image: string | null;
    sale_type: string | null;
    status: string;
  };
};

type Viewing = {
  id: string;
  buyer_id: string;
  listing_id: string;
  scheduled_for: string;
  status: string;
  listing?: {
    id: string;
    title: string;
    suburb: string | null;
    city: string | null;
    cover_image: string | null;
  };
};

type RecommendedListing = MatchListing & {
  price_per_month: number | null;
  sale_type: string | null;
  listing_type: string | null;
  parking: number | null;
  cover_image: string | null;
  status: string | null;
  match: ListingMatch;
};

/* ----------------------------- Helpers ----------------------------- */

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtMaybeMoney(n: number | null) {
  if (n === null) return "—";
  return formatZAR(n);
}

function fmtRecommendedPrice(listing: RecommendedListing) {
  if (listing.sale_type === "rent") {
    return listing.price_per_month
      ? `${formatZAR(listing.price_per_month)} / month`
      : "-";
  }

  return listing.price !== null ? formatZAR(listing.price) : "-";
}

function fmtListingPrice(listing?: Enquiry["listing"] | SavedItem["listing"]) {
  if (!listing) return "—";

  if ("sale_type" in listing && listing.sale_type === "rent") {
    return listing.price_per_month
      ? `${formatZAR(listing.price_per_month)} / month`
      : "—";
  }

  return listing.price !== null ? formatZAR(listing.price) : "—";
}

function fmtDateTime(iso: string) {
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

function localDatetimeToIso(local: string) {
  const d = new Date(local);
  return d.toISOString();
}

function oneRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function getBuyerAreas(buyer: Buyer | null) {
  return buyer?.areas?.length ? buyer.areas : buyer?.areas_multi ?? [];
}

/* ----------------------------- Page ----------------------------- */

export default function BuyerDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [buyer, setBuyer] = useState<Buyer | null>(null);

  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedListing[]>([]);

  const [error, setError] = useState<string | null>(null);

  /* ---------- Data fetchers ---------- */

  async function getAuthedUserIdOrRedirect() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      router.push("/login?next=/dashboard/buyer");
      return null;
    }

    return user.id;
  }

  async function loadBuyerByUserId(userId: string) {
    const { data: buyerRow, error: buyerErr } = await supabase
      .from("buyers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (buyerErr) throw new Error(buyerErr.message);
    if (!buyerRow) return null;

    const normalizedBuyer = buyerRow as Buyer;
    return {
      ...normalizedBuyer,
      areas: getBuyerAreas(normalizedBuyer),
    };
  }

  async function loadBuyerLists(currentBuyer: Buyer, userId: string) {
    const [
      { data: savedRows, error: savedErr },
      { data: enquiryRows, error: enquiryErr },
      { data: viewingRows, error: viewingErr },
    ] = await Promise.all([
      supabase
        .from("buyer_saved")
        .select(
          "id,buyer_id,listing_id,created_at, listing:listings(id,title,price,suburb,city,bedrooms,bathrooms,cover_image,status)"
        )
        .eq("buyer_id", currentBuyer.id)
        .order("created_at", { ascending: false })
        .limit(8),

      supabase
        .from("enquiries")
        .select(
          "id,user_id,listing_id,status,latest_message,enquiry_count,request_viewing,first_enquired_at,last_enquired_at, listing:listings(id,title,price,price_per_month,suburb,city,cover_image,sale_type,status)"
        )
        .eq("user_id", userId)
        .order("last_enquired_at", { ascending: false })
        .limit(8),

      supabase
        .from("buyer_viewings")
        .select(
          "id,buyer_id,listing_id,scheduled_for,status, listing:listings(id,title,suburb,city,cover_image)"
        )
        .eq("buyer_id", currentBuyer.id)
        .order("scheduled_for", { ascending: true })
        .limit(8),
    ]);

    if (savedErr) throw new Error(savedErr.message);
    if (enquiryErr) throw new Error(enquiryErr.message);
    if (viewingErr) throw new Error(viewingErr.message);

    const nextSaved = (savedRows ?? []).map((row) => ({
        ...row,
        listing: oneRelated(row.listing),
      })) as SavedItem[];

    setSaved(nextSaved);

    setEnquiries(
      (enquiryRows ?? []).map((row) => ({
        ...row,
        listing: oneRelated(row.listing),
      })) as Enquiry[]
    );

    setViewings(
      (viewingRows ?? []).map((row) => ({
        ...row,
        listing: oneRelated(row.listing),
      })) as Viewing[]
    );

    await loadRecommendedListings(currentBuyer, nextSaved);
  }

  async function loadRecommendedListings(
    currentBuyer: Buyer,
    savedRows: SavedItem[] = saved
  ) {
    const savedIds = new Set(savedRows.map((item) => item.listing_id));

    const { data, error: listingErr } = await supabase
      .from("listings")
      .select(
        "id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,parking,cover_image,status"
      )
      .eq("status", "active")
      .limit(40);

    if (listingErr) throw new Error(listingErr.message);

    const scored = ((data ?? []) as Omit<RecommendedListing, "match">[])
      .filter((listing) => !savedIds.has(listing.id))
      .map((listing) => ({
        ...listing,
        match: scoreListingForBuyer(listing, currentBuyer),
      }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 4);

    setRecommendations(scored);
  }

  async function refreshAll() {
    setError(null);

    const userId = await getAuthedUserIdOrRedirect();
    if (!userId) return;

    const b = await loadBuyerByUserId(userId);
    if (!b) {
      router.push("/signup/buyer");
      return;
    }

    setBuyer(b);
    await loadBuyerLists(b, userId);
  }

  /* ---------- Actions ---------- */

  async function onUnsave(savedRowId: string) {
    setError(null);

    try {
      const { error: delErr } = await supabase
        .from("buyer_saved")
        .delete()
        .eq("id", savedRowId);

      if (delErr) throw new Error(delErr.message);

      await refreshAll();
    } catch (e: any) {
      setError(e?.message ?? "Could not remove saved item.");
    }
  }

  async function onScheduleViewing(listingId: string, localValue: string) {
    setError(null);

    try {
      const userId = await getAuthedUserIdOrRedirect();
      if (!userId) return;

      const b = buyer ?? (await loadBuyerByUserId(userId));
      if (!b) {
        router.push("/signup/buyer");
        return;
      }

      const whenIso = localDatetimeToIso(localValue);

      const { error: insErr } = await supabase.from("buyer_viewings").insert({
        buyer_id: b.id,
        listing_id: listingId,
        scheduled_for: whenIso,
        status: "Scheduled",
      });

      if (insErr) throw new Error(insErr.message);

      await refreshAll();
    } catch (e: any) {
      setError(e?.message ?? "Could not schedule viewing.");
    }
  }

  /* ---------- Initial load ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        await refreshAll();
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const savedCount = saved.length;
    const enquiryCount = enquiries.length;
    const viewingsThisWeek = viewings.filter((v) => {
      const d = new Date(v.scheduled_for);
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const matchScore = buyer?.lead_score ?? null;

    return { savedCount, enquiryCount, viewingsThisWeek, matchScore };
  }, [saved, enquiries, viewings, buyer]);

  return (
    <main className="tech-page text-slate-900">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-semibold">Buyer Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your shortlist, enquiries, and next steps — in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/listings"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Browse listings
            </Link>
            <Link
              href="/dashboard/buyer/compare"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 sm:inline-flex"
            >
              Compare
            </Link>
            <Link
              href="/dashboard/buyer/alerts"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 sm:inline-flex"
            >
              Alerts
            </Link>

            <Link
              href="/dashboard/buyer/profile"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Edit preferences
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-slate-50 md:col-span-2" />
              <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {buyer?.full_name ?? "Your profile"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Budget:{" "}
                    <span className="font-medium text-slate-800">
                      {fmtMaybeMoney(buyer?.budget_min ?? null)} –{" "}
                      {fmtMaybeMoney(buyer?.budget_max ?? null)}
                    </span>
                    {" · "}
                    Pre-approval:{" "}
                    <span className="font-medium text-slate-800">
                      {buyer?.preapproved ?? "—"}
                    </span>
                    {" · "}
                    Timeline:{" "}
                    <span className="font-medium text-slate-800">
                      {buyer?.timeline ?? "—"}
                    </span>
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      label={
                        buyer?.property_types?.length
                          ? buyer.property_types.join(" · ")
                          : "No property types set"
                      }
                    />
                    <Badge
                      label={
                        getBuyerAreas(buyer).length
                          ? getBuyerAreas(buyer).join(" / ")
                          : "No areas set"
                      }
                    />
                    <Badge
                      label={`Beds: ${buyer?.bedrooms_min ?? "—"}+ · Baths: ${
                        buyer?.bathrooms_min ?? "—"
                      }+`}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Match score
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {buyer?.lead_score ?? 0}
                        <span className="text-sm text-slate-500">/100</span>
                      </p>
                    </div>

                    <div className="w-36">
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{ width: `${buyer?.lead_score ?? 0}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        Higher = faster matching
                      </p>
                    </div>
                  </div>

                  {buyer?.preapproved !== "Yes" && (
                    <a
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                      href="https://www.ooba.co.za/home-loans/pre-approval/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Get pre-approved
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatCard title="Saved homes" value={stats.savedCount.toString()} />
              <StatCard title="Active enquiries" value={stats.enquiryCount.toString()} />
              <StatCard title="Viewings this week" value={stats.viewingsThisWeek.toString()} />
              <StatCard title="Lead score" value={(stats.matchScore ?? 0).toString()} />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <SectionCard
                  title="Saved properties"
                  subtitle="Your shortlist. Keep it tight."
                  action={
                    <Link
                      className="text-sm text-emerald-700 underline"
                      href="/dashboard/buyer/saved"
                    >
                      View all
                    </Link>
                  }
                >
                  {saved.length === 0 ? (
                    <EmptyState
                      title="No saved properties yet"
                      description="Start shortlisting homes so we can recommend better matches."
                      ctaHref="/listings"
                      ctaText="Browse listings"
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {saved.map((s) => (
                        <MiniListingCard
                          key={s.id}
                          title={s.listing?.title ?? "Listing"}
                          subtitle={[s.listing?.suburb, s.listing?.city]
                            .filter(Boolean)
                            .join(", ")}
                          price={s.listing?.price ?? null}
                          meta={`${s.listing?.bedrooms ?? "—"} bd · ${s.listing?.bathrooms ?? "—"} ba`}
                          href={`/listings/${s.listing_id}`}
                          actions={
                            <>
                              <button
                                type="button"
                                onClick={() => onUnsave(s.id)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-white"
                              >
                                Unsave
                              </button>

                              <Link
                                href={`/listings/${s.listing_id}#enquire`}
                                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                              >
                                Enquire
                              </Link>
                            </>
                          }
                        />
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="My enquiries"
                  subtitle="Track your interest and next steps."
                  action={
                    <Link
                      className="text-sm text-emerald-700 underline"
                      href="/dashboard/buyer/enquiries"
                    >
                      View all
                    </Link>
                  }
                >
                  {enquiries.length === 0 ? (
                    <EmptyState
                      title="No enquiries yet"
                      description="Send an enquiry on a listing to start the conversation."
                      ctaHref="/listings"
                      ctaText="Browse listings"
                    />
                  ) : (
                    <div className="space-y-3">
                      {enquiries.map((e) => (
                        <div key={e.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {e.listing?.title ?? "Listing"}
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {fmtListingPrice(e.listing)}
                              </p>

                              <p className="mt-1 truncate text-sm text-slate-600">
                                {e.latest_message ?? "No messages yet."}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>Updated {fmtDateTime(e.last_enquired_at)}</span>
                                <span>•</span>
                                <span>
                                  {e.enquiry_count} enquiry
                                  {e.enquiry_count === 1 ? "" : "ies"}
                                </span>
                                {e.request_viewing ? (
                                  <>
                                    <span>•</span>
                                    <span>Viewing requested</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <StatusPill status={e.status} />
                              <Link
                                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                                href={`/listings/${e.listing_id}#enquire`}
                              >
                                View
                              </Link>
                            </div>
                          </div>

                          <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Schedule a viewing
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="datetime-local"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                                onChange={(ev) => {
                                  const val = ev.target.value;
                                  if (!val) return;
                                  onScheduleViewing(e.listing_id, val);
                                  ev.target.value = "";
                                }}
                              />
                              <Link
                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-white"
                                href={`/listings/${e.listing_id}`}
                              >
                                Listing
                              </Link>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              Pick a date and time. It will appear on your viewing schedule.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>

              <div className="space-y-6">
                <SectionCard title="Viewing schedule" subtitle="Next appointments.">
                  {viewings.length === 0 ? (
                    <EmptyState
                      title="No viewings scheduled"
                      description="When you book a viewing, it will show here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {viewings.map((v) => (
                        <div key={v.id} className="rounded-2xl border border-slate-200 p-4">
                          <p className="font-semibold">{v.listing?.title ?? "Viewing"}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {fmtDateTime(v.scheduled_for)}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <StatusPill status={v.status} />
                            <Link
                              className="text-sm text-emerald-700 underline"
                              href={`/listings/${v.listing_id}`}
                            >
                              View listing
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Progress" subtitle="Clear next steps.">
                  <ProgressTracker
                    preapproved={buyer?.preapproved ?? null}
                    hasAreas={getBuyerAreas(buyer).length > 0}
                    hasSaved={saved.length > 0}
                    hasEnquiries={enquiries.length > 0}
                  />
                </SectionCard>

                <SectionCard title="Recommended" subtitle="Scored against your preferences.">
                  {recommendations.length === 0 ? (
                    <EmptyState
                      title="No matches yet"
                      description="Add budget, areas, and property types to unlock better recommendations."
                      ctaHref="/dashboard/buyer/profile"
                      ctaText="Edit preferences"
                    />
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((listing) => (
                        <RecommendationCard
                          key={listing.id}
                          listing={listing}
                          onSaved={refreshAll}
                        />
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ----------------------------- UI Components ----------------------------- */

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
      {label}
    </span>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  ctaHref,
  ctaText,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaText?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {ctaHref && ctaText && (
        <Link
          href={ctaHref}
          className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
        >
          {ctaText}
        </Link>
      )}
    </div>
  );
}

function MiniListingCard({
  title,
  subtitle,
  price,
  meta,
  href,
  actions,
}: {
  title: string;
  subtitle: string;
  price: number | null;
  meta: string;
  href: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
      <Link href={href} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            <p className="mt-1 truncate text-sm text-slate-600">{subtitle}</p>
            <p className="mt-2 text-xs text-slate-500">{meta}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-slate-900">
            {price === null ? "—" : formatZAR(price)}
          </p>
        </div>
      </Link>

      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function RecommendationCard({
  listing,
  onSaved,
}: {
  listing: RecommendedListing;
  onSaved: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {listing.match.score}% match
            </span>
            {listing.sale_type === "rent" ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                Rent
              </span>
            ) : null}
          </div>

          <Link href={`/listings/${listing.id}`} className="mt-3 block">
            <p className="truncate font-semibold">{listing.title}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {fmtRecommendedPrice(listing)}
            </p>
            <p className="mt-1 truncate text-sm text-slate-600">
              {[listing.suburb, listing.city].filter(Boolean).join(", ") ||
                "Location not specified"}
            </p>
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {listing.match.reasons.map((reason) => (
          <span
            key={reason}
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
          >
            {reason}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SaveListingButton listingId={listing.id} compact onChange={onSaved} />
        <CompareListingButton listing={listing} />
        <Link
          href={`/listings/${listing.id}#enquire`}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
        >
          Enquire
        </Link>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();

  const cls =
    s.includes("new") || s.includes("open")
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : s.includes("scheduled") || s.includes("progress") || s.includes("active")
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : s.includes("closed") || s.includes("done")
      ? "border-slate-200 bg-white text-slate-700"
      : "border-slate-200 bg-white text-slate-700";

  return <span className={`rounded-full border px-3 py-1 text-xs ${cls}`}>{status || "—"}</span>;
}

function ProgressTracker({
  preapproved,
  hasAreas,
  hasSaved,
  hasEnquiries,
}: {
  preapproved: string | null;
  hasAreas: boolean;
  hasSaved: boolean;
  hasEnquiries: boolean;
}) {
  const steps = [
    { label: "Profile complete", done: true },
    { label: "Set preferences (areas)", done: hasAreas },
    { label: "Shortlist homes", done: hasSaved },
    { label: "Start enquiries", done: hasEnquiries },
    { label: "Pre-approved", done: preapproved === "Yes" },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{pct}% complete</p>
        <p className="text-xs text-slate-600">
          {doneCount}/{steps.length}
        </p>
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
          >
            <span className="text-sm text-slate-700">{s.label}</span>
            <span
              className={`text-xs font-semibold ${
                s.done ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {s.done ? "Done" : "Next"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
