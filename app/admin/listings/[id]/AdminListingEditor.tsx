"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getListingQuality, type ListingQualityInput } from "@/lib/listing-quality";

const LISTING_TYPES = ["house", "apartment", "townhouse", "duplex", "cluster", "land", "commercial"];
const SALE_TYPES = ["sale", "rent"];

type Listing = ListingQualityInput & {
  id: string;
  agent_id: string | null;
  status: string | null;
  street_address: string | null;
  postal_code: string | null;
  deposit: number | null;
  available_from: string | null;
  garages: number | null;
  parking: number | null;
  floor_size_m2: number | null;
  erf_size_m2: number | null;
  levy: number | null;
  rates_taxes: number | null;
  pets_allowed: boolean | null;
  furnished: boolean | null;
  features: string[] | null;
};

export default function AdminListingEditor({ initialListing }: { initialListing: Listing }) {
  const [listing, setListing] = useState<Listing>({
    ...initialListing,
    images: Array.isArray(initialListing.images) ? initialListing.images : [],
    features: Array.isArray(initialListing.features) ? initialListing.features : [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quality = useMemo(() => getListingQuality(listing), [listing]);

  function update<K extends keyof Listing>(key: K, value: Listing[K]) {
    setListing((prev) => ({ ...prev, [key]: value }));
  }

  function numberValue(value: string) {
    const cleaned = value.trim().replace(/[^\d.]/g, "");
    if (!cleaned) return null;
    const next = Number(cleaned);
    return Number.isFinite(next) ? next : null;
  }

  function intValue(value: string) {
    const next = numberValue(value);
    return next === null ? null : Math.trunc(next);
  }

  async function save(nextStatus = listing.status ?? "draft") {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...listing,
          status: nextStatus,
          images: listing.images ?? [],
          features: listing.features ?? [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save listing.");

      setListing((prev) => ({ ...prev, status: nextStatus }));
      setMessage(nextStatus === "active" ? "Listing saved and published." : "Listing saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save listing.");
    } finally {
      setSaving(false);
    }
  }

  const imageText = (listing.images ?? []).join("\n");
  const featureText = (listing.features ?? []).join(", ");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Core</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <input className="admin-input" value={listing.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            </Field>
            <Field label="Status">
              <select className="admin-input" value={listing.status ?? "draft"} onChange={(e) => update("status", e.target.value)}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </Field>
            <Field label="Sale type">
              <select className="admin-input" value={listing.sale_type ?? "sale"} onChange={(e) => update("sale_type", e.target.value)}>
                {SALE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Listing type">
              <select className="admin-input" value={listing.listing_type ?? "house"} onChange={(e) => update("listing_type", e.target.value)}>
                {LISTING_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="admin-input min-h-40"
              value={listing.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Pricing and Details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Sale price">
              <input className="admin-input" value={listing.price ?? ""} onChange={(e) => update("price", numberValue(e.target.value))} />
            </Field>
            <Field label="Rent per month">
              <input className="admin-input" value={listing.price_per_month ?? ""} onChange={(e) => update("price_per_month", numberValue(e.target.value))} />
            </Field>
            <Field label="Deposit">
              <input className="admin-input" value={listing.deposit ?? ""} onChange={(e) => update("deposit", numberValue(e.target.value))} />
            </Field>
            <Field label="Bedrooms">
              <input className="admin-input" value={listing.bedrooms ?? ""} onChange={(e) => update("bedrooms", intValue(e.target.value))} />
            </Field>
            <Field label="Bathrooms">
              <input className="admin-input" value={listing.bathrooms ?? ""} onChange={(e) => update("bathrooms", numberValue(e.target.value))} />
            </Field>
            <Field label="Garages">
              <input className="admin-input" value={listing.garages ?? ""} onChange={(e) => update("garages", intValue(e.target.value))} />
            </Field>
            <Field label="Parking">
              <input className="admin-input" value={listing.parking ?? ""} onChange={(e) => update("parking", intValue(e.target.value))} />
            </Field>
            <Field label="Floor size m2">
              <input className="admin-input" value={listing.floor_size_m2 ?? ""} onChange={(e) => update("floor_size_m2", intValue(e.target.value))} />
            </Field>
            <Field label="Erf size m2">
              <input className="admin-input" value={listing.erf_size_m2 ?? ""} onChange={(e) => update("erf_size_m2", intValue(e.target.value))} />
            </Field>
            <Field label="Levy">
              <input className="admin-input" value={listing.levy ?? ""} onChange={(e) => update("levy", numberValue(e.target.value))} />
            </Field>
            <Field label="Rates and taxes">
              <input className="admin-input" value={listing.rates_taxes ?? ""} onChange={(e) => update("rates_taxes", numberValue(e.target.value))} />
            </Field>
            <Field label="Available from">
              <input className="admin-input" type="date" value={listing.available_from ?? ""} onChange={(e) => update("available_from", e.target.value || null)} />
            </Field>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Toggle label="Pets allowed" checked={Boolean(listing.pets_allowed)} onChange={(value) => update("pets_allowed", value)} />
            <Toggle label="Furnished" checked={Boolean(listing.furnished)} onChange={(value) => update("furnished", value)} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Street address">
              <input className="admin-input" value={listing.street_address ?? ""} onChange={(e) => update("street_address", e.target.value)} />
            </Field>
            <Field label="Suburb">
              <input className="admin-input" value={listing.suburb ?? ""} onChange={(e) => update("suburb", e.target.value)} />
            </Field>
            <Field label="City">
              <input className="admin-input" value={listing.city ?? ""} onChange={(e) => update("city", e.target.value)} />
            </Field>
            <Field label="Province">
              <input className="admin-input" value={listing.province ?? ""} onChange={(e) => update("province", e.target.value)} />
            </Field>
            <Field label="Postal code">
              <input className="admin-input" value={listing.postal_code ?? ""} onChange={(e) => update("postal_code", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Photos and Features</h2>
          <div className="mt-5 grid gap-5">
            <Field label="Image URLs, one per line">
              <textarea
                className="admin-input min-h-36"
                value={imageText}
                onChange={(e) =>
                  update(
                    "images",
                    e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .slice(0, 50)
                  )
                }
              />
            </Field>
            <Field label="Cover image URL">
              <input className="admin-input" value={listing.cover_image ?? ""} onChange={(e) => update("cover_image", e.target.value || null)} />
            </Field>
            {(listing.images ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(listing.images ?? []).slice(0, 12).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => update("cover_image", src)}
                    className="overflow-hidden rounded-2xl border border-slate-200 text-left"
                  >
                    <img src={src} alt="Listing" className="h-28 w-full object-cover" />
                    <span className="block px-3 py-2 text-xs font-semibold">
                      {listing.cover_image === src ? "Cover" : "Set cover"}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            <Field label="Features, comma separated">
              <input
                className="admin-input"
                value={featureText}
                onChange={(e) =>
                  update(
                    "features",
                    e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
              />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Handover Contact</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Contact name">
              <input className="admin-input" value={listing.contact_name ?? ""} onChange={(e) => update("contact_name", e.target.value)} />
            </Field>
            <Field label="Contact email">
              <input className="admin-input" value={listing.contact_email ?? ""} onChange={(e) => update("contact_email", e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <input className="admin-input" value={listing.contact_phone ?? ""} onChange={(e) => update("contact_phone", e.target.value)} />
            </Field>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Mia Readiness</h2>
              <p className="mt-1 text-sm text-slate-600">{quality.score}% complete</p>
            </div>
            <span
              className={
                quality.isPublishable
                  ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                  : "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
              }
            >
              {quality.isPublishable ? "Publishable" : "Needs work"}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {quality.checks.map((check) => (
              <div key={check.key} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{check.label}</p>
                  <span className={check.passed ? "text-xs font-semibold text-emerald-700" : "text-xs font-semibold text-amber-700"}>
                    {check.passed ? "Done" : check.required ? "Required" : "Improve"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
              </div>
            ))}
          </div>

          {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => save(listing.status ?? "draft")}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              disabled={saving || !quality.isPublishable}
              onClick={() => save("active")}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              Publish as active
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save("inactive")}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              Mark inactive
            </button>
            {listing.status === "active" ? (
              <Link href={`/listings/${listing.id}`} className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50">
                View public listing
              </Link>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 grid gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" />
    </label>
  );
}
