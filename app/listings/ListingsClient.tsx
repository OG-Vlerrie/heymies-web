"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CompareListingButton from "@/components/listings/CompareListingButton";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type PublicListing = {
  id: string;
  title: string;
  sale_type: "sale" | "rent" | null;
  listing_type: string | null;
  suburb: string | null;
  city: string | null;
  price: number | null;
  price_per_month: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  cover_image: string | null;
  status: string | null;
  created_at: string;
};

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingsClient({
  initialListings,
  initialError,
}: {
  initialListings: PublicListing[];
  initialError: string | null;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [listings, setListings] = useState(initialListings);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(initialListings.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);

      const { data, error: loadErr } = await supabase
        .from("listings")
        .select(
          "id, title, suburb, city, price, price_per_month, sale_type, listing_type, bedrooms, bathrooms, parking, cover_image, status, created_at"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(60);

      if (cancelled) return;

      if (loadErr) {
        setError(loadErr.message);
      } else {
        setError(null);
        setListings((data ?? []) as PublicListing[]);
      }

      setLoading(false);
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="grid gap-4">
      <div className="tech-panel rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Search
            </label>
            <input
              placeholder="e.g. Sandton, 2-bed, townhouse..."
              className="tech-input w-full rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Max price
            </label>
            <select className="tech-input w-full rounded-xl px-4 py-3 text-sm outline-none">
              <option value="">Any</option>
              <option value="1500000">R1 500 000</option>
              <option value="2500000">R2 500 000</option>
              <option value="3500000">R3 500 000</option>
              <option value="5000000">R5 000 000</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Beds
            </label>
            <select className="tech-input w-full rounded-xl px-4 py-3 text-sm outline-none">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && listings.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="tech-card rounded-3xl p-8">
          <h3 className="text-xl font-semibold text-slate-950">No active listings yet</h3>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Once listings are published, buyers will see match scores, save homes,
            compare shortlists, and enquire from here.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DemoMetric label="Match scoring" value="Ready" />
            <DemoMetric label="Saved homes" value="Enabled" />
            <DemoMetric label="Compare view" value="Up to 4" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: PublicListing }) {
  const isRent = listing.sale_type === "rent";
  const price = isRent ? listing.price_per_month : listing.price;

  return (
    <div className="relative">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="tech-card rounded-3xl p-5 transition">
          {listing.cover_image ? (
            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={listing.cover_image}
                alt={listing.title}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="mb-4 flex h-44 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
              No photo
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{listing.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {(listing.suburb ?? "-")}, {(listing.city ?? "-")}
              </p>
            </div>

            {isRent ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Rent
              </span>
            ) : null}
          </div>

          <div className="mt-5 text-xl font-semibold text-slate-950">
            {price ? formatZAR(price) : "-"}
            {isRent ? <span className="ml-2 text-sm font-semibold text-slate-600">/mo</span> : null}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
            <Stat label="Beds" value={listing.bedrooms ?? 0} />
            <Stat label="Baths" value={listing.bathrooms ?? 0} />
            <Stat label="Parking" value={listing.parking ?? 0} />
          </div>

          <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Log in to see match score
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            View details <span aria-hidden>{">"}</span>
          </div>
        </div>
      </Link>
      <SaveListingButton
        listingId={listing.id}
        compact
        checkOnMount={false}
        className="absolute right-3 top-3 inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-60"
      />
      <CompareListingButton
        listing={listing}
        className="absolute left-3 top-3 inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white"
      />
    </div>
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

function DemoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
