import EnquiryGate from "@/components/listings/EnquiryGate";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_per_month: number | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  street_address: string | null;
  postal_code: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  parking: number | null;
  floor_size_m2: number | null;
  erf_size_m2: number | null;
  sale_type: string | null;
  listing_type: string | null;
  status: string;
  cover_image: string | null;
  images: string[] | null;
};

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: l, error } = await supabase
    .from("listings")
    .select(
      "id,title,description,price,price_per_month,suburb,city,province,street_address,postal_code,bedrooms,bathrooms,garages,parking,floor_size_m2,erf_size_m2,sale_type,listing_type,status,cover_image,images"
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !l) {
    return notFound();
  }

  const listing = l as Listing;

  const addressLine = [listing.suburb, listing.city, listing.province]
    .filter(Boolean)
    .join(", ");

  const heroImage = listing.cover_image || listing.images?.[0] || null;

  const displayPrice =
    listing.sale_type === "rent"
      ? listing.price_per_month
        ? `${formatZAR(listing.price_per_month)} / month`
        : "—"
      : listing.price
      ? formatZAR(listing.price)
      : "—";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-5">
          {/* LEFT */}
          <div className="md:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={listing.title}
                  className="h-[320px] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center bg-slate-50 text-sm text-slate-500">
                  No image
                </div>
              )}

              <div className="p-6">
                <h1 className="text-3xl font-semibold">{listing.title}</h1>
                <p className="mt-2 text-sm text-slate-600">{addressLine || "—"}</p>

                <div className="mt-6 text-2xl font-semibold">{displayPrice}</div>

                {listing.description ? (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {listing.description}
                  </div>
                ) : null}

                {/* Gallery */}
                {listing.images && listing.images.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {listing.images.slice(0, 9).map((src) => (
                      <div
                        key={src}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-28 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Key details</h2>

              <div className="mt-4 grid gap-3">
                <KV label="Beds" value={listing.bedrooms ?? "—"} />
                <KV label="Baths" value={listing.bathrooms ?? "—"} />
                <KV label="Garages" value={listing.garages ?? "—"} />
                <KV label="Parking" value={listing.parking ?? "—"} />
                <KV label="Type" value={listing.listing_type ?? "—"} />
                <KV label="Sale type" value={listing.sale_type ?? "—"} />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Location</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                {[listing.street_address, addressLine, listing.postal_code]
                  .filter(Boolean)
                  .join("\n") || "—"}
              </p>
              <p className="mt-3 text-xs text-slate-500">(Map coming next)</p>
            </div>

            {/* Enquiry gate */}
            <EnquiryGate listingId={listing.id} />
          </div>
        </div>

        <footer className="mt-14 border-t px-2 py-10 text-sm text-slate-600">
          <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
        </footer>
      </div>
    </main>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
