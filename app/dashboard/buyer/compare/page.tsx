"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCompareChangeEvent,
  getCompareStorageKey,
  type CompareListingSnapshot,
} from "@/components/listings/CompareListingButton";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { scoreListingForBuyer, type BuyerMatchProfile } from "@/lib/matching";

type Listing = CompareListingSnapshot & {
  garages: number | null;
  floor_size_m2: number | null;
  erf_size_m2: number | null;
  status: string | null;
};

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function displayPrice(listing: Listing) {
  if (listing.sale_type === "rent") {
    return listing.price_per_month ? `${formatZAR(listing.price_per_month)} / month` : "-";
  }
  return listing.price !== null ? formatZAR(listing.price) : "-";
}

function readCompareIds() {
  try {
    const raw = window.localStorage.getItem(getCompareStorageKey());
    const items = raw ? (JSON.parse(raw) as CompareListingSnapshot[]) : [];
    return items.map((item) => item.id).slice(0, 4);
  } catch {
    return [];
  }
}

function removeCompareId(id: string) {
  const raw = window.localStorage.getItem(getCompareStorageKey());
  const items = raw ? (JSON.parse(raw) as CompareListingSnapshot[]) : [];
  window.localStorage.setItem(
    getCompareStorageKey(),
    JSON.stringify(items.filter((item) => item.id !== id))
  );
  window.dispatchEvent(new Event(getCompareChangeEvent()));
}

export default function BuyerComparePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [listings, setListings] = useState<Listing[]>([]);
  const [buyer, setBuyer] = useState<BuyerMatchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadComparison() {
    const params = new URLSearchParams(window.location.search);
    const urlIds = (params.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 4);
    const ids = urlIds.length ? urlIds : readCompareIds();

    if (urlIds.length) {
      window.localStorage.setItem(
        getCompareStorageKey(),
        JSON.stringify(urlIds.map((id) => ({ id })))
      );
    }

    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      setShareUrl("");
      return;
    }

    setLoading(true);

    const [{ data: auth }, { data }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("listings")
        .select(
          "id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,parking,garages,floor_size_m2,erf_size_m2,cover_image,status"
        )
        .in("id", ids),
    ]);

    const user = auth.user;
    if (user) {
      const { data: buyerRow } = await supabase
        .from("buyers")
        .select("budget_min,budget_max,property_types,areas,areas_multi,bedrooms_min,bathrooms_min")
        .eq("user_id", user.id)
        .maybeSingle();

      setBuyer((buyerRow as BuyerMatchProfile | null) ?? null);
    }

    const rows = ((data ?? []) as Listing[]).sort(
      (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)
    );

    setListings(rows);
    const nextShareUrl = `${window.location.origin}/dashboard/buyer/compare?ids=${rows
      .map((row) => row.id)
      .join(",")}`;
    setShareUrl(nextShareUrl);
    window.history.replaceState(null, "", nextShareUrl);
    setLoading(false);
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  useEffect(() => {
    loadComparison();
    window.addEventListener(getCompareChangeEvent(), loadComparison);
    window.addEventListener("storage", loadComparison);

    return () => {
      window.removeEventListener(getCompareChangeEvent(), loadComparison);
      window.removeEventListener("storage", loadComparison);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tech-kicker">Buyer workspace</p>
            <h1 className="mt-3 text-3xl font-semibold">Compare listings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review up to four homes side by side before you enquire or book a viewing.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/buyer/saved" className="tech-button-secondary rounded-xl px-4 py-2 text-sm">
              Saved
            </Link>
            {shareUrl ? (
              <button
                type="button"
                onClick={copyShareLink}
                className="tech-button-secondary rounded-xl px-4 py-2 text-sm"
              >
                {copied ? "Copied" : "Share"}
              </button>
            ) : null}
            <Link href="/listings" className="tech-button-primary rounded-xl px-4 py-2 text-sm">
              Add listings
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        ) : listings.length === 0 ? (
          <div className="tech-card mt-8 rounded-3xl p-8">
            <h2 className="text-xl font-semibold">Nothing selected yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use the Compare button on listing cards or saved homes to build this view.
            </p>
            <Link href="/listings" className="tech-button-primary mt-5 rounded-xl px-4 py-2 text-sm">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div
              className="grid min-w-[760px]"
              style={{ gridTemplateColumns: `180px repeat(${listings.length}, minmax(180px, 1fr))` }}
            >
              <Cell heading />
              {listings.map((listing) => {
                const match = buyer ? scoreListingForBuyer(listing, buyer) : null;
                return (
                  <div key={listing.id} className="border-b border-l border-slate-200 p-4">
                    {listing.cover_image ? (
                      <img
                        src={listing.cover_image}
                        alt={listing.title}
                        className="h-32 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-50 text-xs text-slate-500">
                        No photo
                      </div>
                    )}
                    <Link href={`/listings/${listing.id}`} className="mt-3 block font-semibold">
                      {listing.title}
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                          {match.score}% match
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                          Complete profile
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <Row label="Price" values={listings.map(displayPrice)} />
              <Row label="Area" values={listings.map((l) => [l.suburb, l.city].filter(Boolean).join(", ") || "-")} />
              <Row label="Type" values={listings.map((l) => l.listing_type ?? "-")} />
              <Row label="Beds" values={listings.map((l) => String(l.bedrooms ?? "-"))} />
              <Row label="Baths" values={listings.map((l) => String(l.bathrooms ?? "-"))} />
              <Row label="Parking" values={listings.map((l) => String(l.parking ?? "-"))} />
              <Row label="Garages" values={listings.map((l) => String(l.garages ?? "-"))} />
              <Row label="Floor size" values={listings.map((l) => (l.floor_size_m2 ? `${l.floor_size_m2} m2` : "-"))} />
              <Row label="Erf size" values={listings.map((l) => (l.erf_size_m2 ? `${l.erf_size_m2} m2` : "-"))} />

              <Cell label="Actions" />
              {listings.map((listing) => (
                <div key={listing.id} className="border-l border-slate-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    <SaveListingButton listingId={listing.id} compact />
                    <Link
                      href={`/listings/${listing.id}#enquire`}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Enquire
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeCompareId(listing.id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Cell({
  label,
  heading = false,
}: {
  label?: string;
  heading?: boolean;
}) {
  return (
    <div
      className={[
        "border-b border-slate-200 p-4 text-sm font-semibold text-slate-600",
        heading ? "bg-slate-50" : "bg-white",
      ].join(" ")}
    >
      {label}
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <>
      <Cell label={label} />
      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="border-b border-l border-slate-200 p-4 text-sm text-slate-800">
          {value}
        </div>
      ))}
    </>
  );
}
