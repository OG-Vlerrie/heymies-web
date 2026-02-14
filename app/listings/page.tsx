import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Listing = {
  id: string;
  title: string;
  suburb: string | null;
  city: string | null;
  price: number | null; // sale price
  price_per_month: number | null; // rent price
  sale_type: "sale" | "rent" | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  cover_image: string | null;
  status: string;
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

export default async function ListingsPage() {
  const supabase = supabasePublic();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, suburb, city, price, price_per_month, sale_type, bedrooms, bathrooms, parking, cover_image, status, created_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  const listings = (data ?? []) as Listing[];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />
      <Browse listings={listings} error={error?.message ?? null} />
      <Footer />
    </main>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.25) 35%, rgba(16,185,129,0.12) 60%, transparent 85%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl">Listings</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          Browse properties and register interest — HeyMies will qualify and
          guide you from enquiry to ready-to-buy.
        </p>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- BROWSE ----------------------------- */

function Browse({ listings, error }: { listings: Listing[]; error: string | null }) {
  return (
    <Section title="Browse available properties" tone="blue">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ListingsBrowser listings={listings} />
    </Section>
  );
}

function ListingsBrowser({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-4">
      {/* Filters are UI-only for now */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Search
            </label>
            <input
              placeholder="e.g. Sandton, 2-bed, townhouse…"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Max price
            </label>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400">
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
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No active listings yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const isRent = l.sale_type === "rent";
            const price = isRent ? l.price_per_month : l.price;

            return (
              <Link key={l.id} href={`/listings/${l.id}`} className="block">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
		{l.cover_image ? (
  <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
    <img
      src={l.cover_image}
      alt={l.title}
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
                      <h3 className="text-base font-semibold">{l.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {(l.suburb ?? "—")}, {(l.city ?? "—")}
                      </p>
                    </div>

                    {isRent ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Rent
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 text-xl font-semibold">
                    {price ? formatZAR(price) : "—"}
                    {isRent ? <span className="ml-2 text-sm font-semibold text-slate-600">/mo</span> : null}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <Stat label="Beds" value={l.bedrooms ?? 0} />
                    <Stat label="Baths" value={l.bathrooms ?? 0} />
                    <Stat label="Parking" value={l.parking ?? 0} />
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}

/* ----------------------------- UI HELPERS ----------------------------- */

function Section({
  id,
  title,
  children,
  tone = "none",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  tone?: "none" | "blue" | "green";
}) {
  const bg =
    tone === "blue"
      ? "bg-blue-50"
      : tone === "green"
      ? "bg-emerald-50"
      : "bg-white";

  return (
    <section id={id} className={bg}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}
