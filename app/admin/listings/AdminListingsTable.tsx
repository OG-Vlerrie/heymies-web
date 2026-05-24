"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Listing = {
  id: string;
  agent_id: string | null;
  title: string | null;
  status: string | null;
  created_at: string | null;
  sale_type: string | null;
  listing_type: string | null;
  price: number | null;
  price_per_month: number | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  cover_image: string | null;
  images: string[] | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  owner_name: string | null;
  owner_role: string | null;
};

type Filter = "all" | "active" | "draft" | "inactive" | "missing_photos";

export default function AdminListingsTable({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState(initialListings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = listings;
    if (filter === "missing_photos") {
      list = list.filter((listing) => imageCount(listing) === 0);
    } else if (filter !== "all") {
      list = list.filter((listing) => listing.status === filter);
    }

    if (!s) return list;

    return list.filter((listing) =>
      [
        listing.title ?? "",
        listing.suburb ?? "",
        listing.city ?? "",
        listing.province ?? "",
        listing.contact_name ?? "",
        listing.contact_email ?? "",
        listing.owner_name ?? "",
        listing.owner_role ?? "",
        listing.status ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [filter, listings, q]);

  async function setStatus(id: string, status: "active" | "draft" | "inactive") {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update listing.");

      setListings((prev) =>
        prev.map((listing) => (listing.id === id ? { ...listing, status } : listing))
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to update listing.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search title, area, owner, contact..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 md:w-96"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none md:w-48"
          >
            <option value="all">All listings</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="missing_photos">Missing photos</option>
          </select>
        </div>

        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{listings.length}</span>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Listing</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Area</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">Photos</th>
              <th className="px-4 py-3 text-left font-semibold">Owner/contact</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => (
              <tr key={listing.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3">
                  <div className="flex min-w-72 gap-3">
                    {listing.cover_image ? (
                      <img
                        src={listing.cover_image}
                        alt={listing.title ?? "Listing"}
                        className="h-16 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                        No photo
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/admin/listings/${listing.id}`}
                        className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                      >
                        {listing.title ?? "Untitled listing"}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {listing.listing_type ?? "property"} / {listing.sale_type ?? "sale"} /{" "}
                        {listing.created_at ? formatDate(listing.created_at) : "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {listing.bedrooms ?? "-"} bed / {listing.bathrooms ?? "-"} bath
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={listing.status ?? "unknown"} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {[listing.suburb, listing.city, listing.province].filter(Boolean).join(", ") || "-"}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(listing)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      imageCount(listing) === 0
                        ? "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                        : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                    }
                  >
                    {imageCount(listing)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p className="font-medium text-slate-900">
                    {listing.owner_name ?? listing.contact_name ?? "Unknown owner"}
                  </p>
                  <p className="mt-1 text-xs">{listing.owner_role ?? "owner"}</p>
                  {listing.contact_email ? (
                    <a className="mt-1 block text-xs underline" href={`mailto:${listing.contact_email}`}>
                      {listing.contact_email}
                    </a>
                  ) : null}
                  {listing.contact_phone ? <p className="text-xs">{listing.contact_phone}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-52 flex-wrap gap-2">
                    <button
                      disabled={busyId === listing.id}
                      onClick={() => setStatus(listing.id, "active")}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Active
                    </button>
                    <button
                      disabled={busyId === listing.id}
                      onClick={() => setStatus(listing.id, "draft")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Draft
                    </button>
                    <button
                      disabled={busyId === listing.id}
                      onClick={() => setStatus(listing.id, "inactive")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Inactive
                    </button>
                    {listing.status === "active" ? (
                      <Link
                        href={`/listings/${listing.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        Public
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-slate-600">
                  No listings match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function imageCount(listing: Listing) {
  return Array.isArray(listing.images) ? listing.images.length : 0;
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "draft"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "inactive"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function formatPrice(listing: Listing) {
  const value = listing.sale_type === "rent" ? listing.price_per_month : listing.price;
  if (value == null) return "-";

  const formatted = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

  return listing.sale_type === "rent" ? `${formatted} / month` : formatted;
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
