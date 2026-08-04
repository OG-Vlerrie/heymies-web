"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CompareListingButton from "@/components/listings/CompareListingButton";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { saleTypeLabel } from "@/lib/display-format";
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
  images: string[] | null;
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

const priceOptions = [
  5000, 10000, 15000, 20000, 30000, 50000, 750000, 1000000, 1500000, 2500000,
  3500000, 5000000, 7500000, 10000000,
];

const propertyTypeOptions = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "duplex", label: "Duplex" },
  { value: "cluster", label: "Cluster" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

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
  const [query, setQuery] = useState("");
  const [saleType, setSaleType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);

      const { data, error: loadErr } = await supabase
        .from("listings")
        .select(
          "id, title, suburb, city, price, price_per_month, sale_type, listing_type, bedrooms, bathrooms, parking, cover_image, images, status, created_at"
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

  const activeFilters = Boolean(
    query ||
      saleType ||
      minPrice ||
      maxPrice ||
      minBeds ||
      minBaths ||
      propertyType ||
      sort !== "newest"
  );

  function resetFilters() {
    setQuery("");
    setSaleType("");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setPropertyType("");
    setSort("newest");
  }

  const filteredListings = listings
    .filter((listing) => {
      const q = query.trim().toLowerCase();
      const searchable = [
        listing.title,
        listing.suburb,
        listing.city,
        listing.listing_type,
        listing.sale_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const listingPrice =
        listing.sale_type === "rent" ? listing.price_per_month : listing.price;

      if (q && !searchable.includes(q)) return false;
      if (saleType && listing.sale_type !== saleType) return false;
      if (propertyType && listing.listing_type !== propertyType) return false;
      if (minPrice) {
        if (listingPrice === null || listingPrice === undefined) return false;
        if (listingPrice < Number(minPrice)) return false;
      }
      if (maxPrice) {
        if (listingPrice === null || listingPrice === undefined) return false;
        if (listingPrice > Number(maxPrice)) return false;
      }
      if (minBeds && (listing.bedrooms ?? 0) < Number(minBeds)) return false;
      if (minBaths && (listing.bathrooms ?? 0) < Number(minBaths)) return false;

      return true;
    })
    .sort((a, b) => {
      const aPrice = a.sale_type === "rent" ? a.price_per_month : a.price;
      const bPrice = b.sale_type === "rent" ? b.price_per_month : b.price;

      if (sort === "price_asc") return (aPrice ?? Number.MAX_SAFE_INTEGER) - (bPrice ?? Number.MAX_SAFE_INTEGER);
      if (sort === "price_desc") return (bPrice ?? 0) - (aPrice ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="grid gap-4">
      <div className="tech-panel rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Search
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Sandton, 2-bed, townhouse..."
              className="tech-input w-full rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          <FilterSelect label="Listing type" value={saleType} onChange={setSaleType}>
            <option value="">Any</option>
            <option value="sale">For sale</option>
            <option value="rent">To rent</option>
          </FilterSelect>

          <FilterSelect label="Property type" value={propertyType} onChange={setPropertyType}>
            <option value="">Any</option>
            {propertyTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Min price" value={minPrice} onChange={setMinPrice}>
            <option value="">Any</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>
                {formatZAR(price)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Max price" value={maxPrice} onChange={setMaxPrice}>
            <option value="">Any</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>
                {formatZAR(price)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Beds" value={minBeds} onChange={setMinBeds}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </FilterSelect>

          <FilterSelect label="Baths" value={minBaths} onChange={setMinBaths}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </FilterSelect>

          <FilterSelect label="Sort" value={sort} onChange={setSort}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
          </FilterSelect>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Reset
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!activeFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset filters
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">
          {filteredListings.length} of {listings.length} listings
        </p>
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
      ) : filteredListings.length === 0 ? (
        <div className="tech-card rounded-3xl p-8">
          <h3 className="text-xl font-semibold text-slate-950">
            {listings.length === 0 ? "No active listings yet" : "No listings match your search"}
          </h3>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            {listings.length === 0
              ? "Once listings are published, buyers will see match guidance, save homes, compare shortlists, and enquire from here."
              : "Try widening the area, budget, or bedroom filters."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DemoMetric label="Match guidance" value="Ready" />
            <DemoMetric label="Saved homes" value="Enabled" />
            <DemoMetric label="Compare view" value="Up to 4" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="tech-input w-full rounded-xl px-4 py-3 text-sm outline-none"
      >
        {children}
      </select>
    </div>
  );
}

function ListingCard({ listing }: { listing: PublicListing }) {
  const isRent = listing.sale_type === "rent";
  const price = isRent ? listing.price_per_month : listing.price;
  const image = listing.cover_image || listing.images?.find(Boolean) || null;

  return (
    <div className="relative">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="tech-card rounded-3xl p-5 transition">
          {image ? (
            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={image}
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
                {saleTypeLabel(listing.sale_type)}
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
            Log in for match guidance
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
        requireAuth
        loginNext={`/listings/${listing.id}`}
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
