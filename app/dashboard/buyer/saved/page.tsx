"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CompareListingButton from "@/components/listings/CompareListingButton";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { scoreListingForBuyer, type BuyerMatchProfile } from "@/lib/matching";

type Buyer = BuyerMatchProfile & {
  id: string;
  user_id: string;
  full_name: string | null;
};

type SavedListing = {
  id: string;
  buyer_id: string;
  listing_id: string;
  created_at: string;
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
    parking: number | null;
    cover_image: string | null;
    status: string | null;
  };
};

function oneRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function displayPrice(listing: SavedListing["listing"]) {
  if (!listing) return "-";
  if (listing.sale_type === "rent") {
    return listing.price_per_month
      ? `${formatZAR(listing.price_per_month)} / month`
      : "-";
  }
  return listing.price !== null ? formatZAR(listing.price) : "-";
}

export default function BuyerSavedPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [saved, setSaved] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSaved() {
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      router.push("/login?next=/dashboard/buyer/saved");
      return;
    }

    const { data: buyerRow, error: buyerErr } = await supabase
      .from("buyers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (buyerErr) throw new Error(buyerErr.message);

    if (!buyerRow) {
      router.push("/signup/buyer?next=/dashboard/buyer/saved");
      return;
    }

    const currentBuyer = buyerRow as Buyer;
    setBuyer(currentBuyer);

    const { data, error: savedErr } = await supabase
      .from("buyer_saved")
      .select(
        "id,buyer_id,listing_id,created_at, listing:listings(id,title,price,price_per_month,sale_type,listing_type,suburb,city,bedrooms,bathrooms,parking,cover_image,status)"
      )
      .eq("buyer_id", currentBuyer.id)
      .order("created_at", { ascending: false });

    if (savedErr) throw new Error(savedErr.message);

    setSaved(
      (data ?? []).map((row) => ({
        ...row,
        listing: oneRelated(row.listing),
      })) as SavedListing[]
    );
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await loadSaved();
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Could not load saved listings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tech-kicker">Buyer workspace</p>
            <h1 className="mt-3 text-3xl font-semibold">Saved listings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Your shortlist with live match scores, quick enquiry links, and one-click removal.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/buyer" className="tech-button-secondary rounded-xl px-4 py-2 text-sm">
              Dashboard
            </Link>
            <Link href="/dashboard/buyer/compare" className="tech-button-secondary rounded-xl px-4 py-2 text-sm">
              Compare
            </Link>
            <Link href="/listings" className="tech-button-primary rounded-xl px-4 py-2 text-sm">
              Browse listings
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="tech-card mt-8 rounded-3xl p-8">
            <h2 className="text-xl font-semibold">No saved listings yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Save homes from the listings page to build your shortlist and sharpen future matches.
            </p>
            <Link href="/listings" className="tech-button-primary mt-5 rounded-xl px-4 py-2 text-sm">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((item) => {
              const listing = item.listing;
              const match = listing && buyer ? scoreListingForBuyer(listing, buyer) : null;

              return (
                <article key={item.id} className="tech-card overflow-hidden rounded-3xl">
                  {listing?.cover_image ? (
                    <img
                      src={listing.cover_image}
                      alt={listing.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-50 text-xs text-slate-500">
                      No photo
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {match?.score ?? 0}% match
                      </span>
                      {listing?.sale_type === "rent" ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                          Rent
                        </span>
                      ) : null}
                    </div>

                    <Link href={`/listings/${item.listing_id}`} className="mt-4 block">
                      <h2 className="line-clamp-2 text-lg font-semibold">
                        {listing?.title ?? "Listing"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {[listing?.suburb, listing?.city].filter(Boolean).join(", ") ||
                          "Location not specified"}
                      </p>
                      <p className="mt-3 text-xl font-semibold">{displayPrice(listing)}</p>
                    </Link>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <Stat label="Beds" value={listing?.bedrooms ?? 0} />
                      <Stat label="Baths" value={listing?.bathrooms ?? 0} />
                      <Stat label="Parking" value={listing?.parking ?? 0} />
                    </div>

                    {match ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {match.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <SaveListingButton listingId={item.listing_id} compact onChange={loadSaved} />
                      {listing ? <CompareListingButton listing={listing} /> : null}
                      <Link
                        href={`/listings/${item.listing_id}#enquire`}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}
