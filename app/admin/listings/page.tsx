export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminListingsTable from "./AdminListingsTable";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ListingRow = {
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

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
};

export default async function AdminListingsPage() {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,agent_id,title,status,created_at,sale_type,listing_type,price,price_per_month,suburb,city,province,bedrooms,bathrooms,cover_image,images,contact_name,contact_email,contact_phone"
    )
    .order("created_at", { ascending: false })
    .limit(400);

  const listingRows = ((data ?? []) as ListingRow[]).map((listing) => ({
    ...listing,
    images: Array.isArray(listing.images) ? listing.images : [],
  }));

  const ownerIds = Array.from(
    new Set(listingRows.map((listing) => listing.agent_id).filter(Boolean) as string[])
  );

  let profiles = new Map<string, ProfileRow>();
  let profileError: string | null = null;

  if (ownerIds.length > 0) {
    const { data: profileRows, error: profilesErr } = await supabase
      .from("profiles")
      .select("id,full_name,role")
      .in("id", ownerIds);

    if (profilesErr) {
      profileError = profilesErr.message;
    } else {
      profiles = new Map(((profileRows ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
    }
  }

  const listings = listingRows.map((listing) => {
    const profile = listing.agent_id ? profiles.get(listing.agent_id) : null;
    return {
      ...listing,
      owner_name: profile?.full_name ?? null,
      owner_role: profile?.role ?? null,
    };
  });

  const active = listings.filter((listing) => listing.status === "active").length;
  const draft = listings.filter((listing) => listing.status === "draft").length;
  const inactive = listings.filter((listing) => listing.status === "inactive").length;
  const missingPhotos = listings.filter((listing) => (listing.images?.length ?? 0) === 0).length;

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Master admin</p>
            <h1 className="mt-2 text-3xl font-semibold">Listings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review publication status, photo health, pricing, locations, and owner/contact details.
            </p>
          </div>
          <Link
            href="/admin"
            className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Admin home
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load listings. {error.message}
          </div>
        ) : (
          <>
            {profileError ? (
              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Listings loaded, but owner profiles could not be attached. {profileError}
              </div>
            ) : null}

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Active" value={active} tone="good" />
              <Metric label="Draft" value={draft} tone="warn" />
              <Metric label="Inactive" value={inactive} tone="muted" />
              <Metric label="Missing photos" value={missingPhotos} tone="warn" />
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Listing Control</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Change status, find empty drafts, and open public listings where available.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {listings.length} loaded
                </span>
              </div>
              <AdminListingsTable initialListings={listings} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link href="/admin" className="text-sm font-semibold text-emerald-700">
      Back to admin
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "warn" | "muted";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
