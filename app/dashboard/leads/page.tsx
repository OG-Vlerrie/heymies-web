"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "agent" | "seller" | "buyer" | "admin";

type EnquiryLead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  enquiry_count: number;
  latest_message: string | null;
  request_viewing: boolean;
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
    status: string;
  };
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

export default function DashboardLeadsPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
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
          "id, full_name, email, phone, status, enquiry_count, latest_message, request_viewing, first_enquired_at, last_enquired_at, listing_id, listing:listings(id,title,suburb,city,cover_image,price,price_per_month,sale_type,status)"
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

      setLeads(
        (data ?? []).map((row) => ({
          ...row,
          listing: oneRelated(row.listing),
        })) as EnquiryLead[]
      );
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
            <div className="p-5 text-sm text-slate-600">
              No enquiries assigned yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((l) => (
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
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <StatusPill status={l.status} />
                        <span className="text-xs text-slate-500">
                          Intent: {l.enquiry_count > 1 ? "High" : "New"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
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
