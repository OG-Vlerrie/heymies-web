import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Listing = {
  id: string;
  title: string;
  sale_type: "sale" | "rent" | null;
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

function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = supabasePublic();

  const pageSize = 60;
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("listings")
    .select(
      "id, title, suburb, city, price, price_per_month, sale_type, bedrooms, bathrooms, parking, cover_image, status, created_at",
      { count: "exact" }
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  const listings = (data ?? []) as Listing[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="tech-page">
      <Hero />
      <Browse
        listings={listings}
        error={error?.message ?? null}
        page={page}
        totalPages={totalPages}
      />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="tech-hero">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-20">
        <p className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
          Property marketplace
        </p>
        <h1 className="mt-6 text-4xl font-semibold md:text-5xl">Listings</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Browse properties and register interest. HeyMies will qualify and guide
          you from enquiry to ready-to-buy.
        </p>
      </div>
    </section>
  );
}

function Browse({
  listings,
  error,
  page,
  totalPages,
}: {
  listings: Listing[];
  error: string | null;
  page: number;
  totalPages: number;
}) {
  return (
    <Section title="Browse available properties" tone="alt">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ListingsBrowser listings={listings} />
      <Pagination page={page} totalPages={totalPages} />
    </Section>
  );
}

function ListingsBrowser({ listings }: { listings: Listing[] }) {
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

      {listings.length === 0 ? (
        <div className="tech-card rounded-2xl p-6 text-sm text-slate-600">
          No active listings yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const isRent = listing.sale_type === "rent";
            const price = isRent ? listing.price_per_month : listing.price;

            return (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="block">
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
                      <h3 className="text-base font-semibold text-slate-950">
                        {listing.title}
                      </h3>
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
                    {isRent ? (
                      <span className="ml-2 text-sm font-semibold text-slate-600">/mo</span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <Stat label="Beds" value={listing.bedrooms ?? 0} />
                    <Stat label="Baths" value={listing.bathrooms ?? 0} />
                    <Stat label="Parking" value={listing.parking ?? 0} />
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    View details <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="tech-panel mt-10 flex items-center justify-between rounded-2xl px-4 py-3">
      <span className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </span>

      <div className="flex gap-2">
        <Link
          href={`/listings?page=${prev}`}
          aria-disabled={page <= 1}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            page <= 1
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "tech-button-secondary"
          }`}
        >
          ← Prev
        </Link>

        <Link
          href={`/listings?page=${next}`}
          aria-disabled={page >= totalPages}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            page >= totalPages
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "tech-button-secondary"
          }`}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
  tone = "none",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  tone?: "none" | "alt";
}) {
  return (
    <section id={id} className={tone === "alt" ? "tech-section-alt" : "tech-section"}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">
        © {new Date().getFullYear()} HeyMies
      </div>
    </footer>
  );
}
