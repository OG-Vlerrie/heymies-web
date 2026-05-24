export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminListingEditor from "./AdminListingEditor";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("listings")
    .select(
      [
        "id",
        "agent_id",
        "title",
        "description",
        "status",
        "sale_type",
        "listing_type",
        "price",
        "price_per_month",
        "deposit",
        "available_from",
        "bedrooms",
        "bathrooms",
        "garages",
        "parking",
        "floor_size_m2",
        "erf_size_m2",
        "levy",
        "rates_taxes",
        "pets_allowed",
        "furnished",
        "street_address",
        "suburb",
        "city",
        "province",
        "postal_code",
        "features",
        "contact_name",
        "contact_email",
        "contact_phone",
        "images",
        "cover_image",
      ].join(",")
    )
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <main className="tech-page text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <BackLink />
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load listing. {error?.message ?? "Not found."}
          </div>
        </div>
      </main>
    );
  }

  const listing = data as any;

  return (
    <main className="tech-page text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <BackLink />
            <p className="tech-kicker mt-6">Master admin</p>
            <h1 className="mt-2 text-3xl font-semibold">{listing.title ?? "Edit listing"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Edit listing content and check whether Mia has enough data to match, nurture, and hand over leads.
            </p>
          </div>
          <Link
            href="/admin"
            className="tech-button-secondary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Admin home
          </Link>
        </div>

        <AdminListingEditor initialListing={listing} />
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link href="/admin/listings" className="text-sm font-semibold text-emerald-700">
      Back to listings
    </Link>
  );
}
