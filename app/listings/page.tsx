import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  area: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  parking: number;
  image?: string; // optional later
  tag?: string; // e.g. "New", "Hot", "Reduced"
};

const LISTINGS: Listing[] = [
  {
    id: "l-001",
    title: "Modern 2-bed apartment",
    area: "Sandton",
    city: "Johannesburg",
    price: 1899000,
    beds: 2,
    baths: 2,
    parking: 1,
    tag: "Hot",
  },
  {
    id: "l-002",
    title: "Family home with garden",
    area: "Durbanville",
    city: "Cape Town",
    price: 3495000,
    beds: 4,
    baths: 3,
    parking: 2,
    tag: "New",
  },
  {
    id: "l-003",
    title: "Lock-up-and-go townhouse",
    area: "Umhlanga",
    city: "Durban",
    price: 2599000,
    beds: 3,
    baths: 2,
    parking: 2,
  },
  {
    id: "l-004",
    title: "Starter 1-bed near transport",
    area: "Rosebank",
    city: "Johannesburg",
    price: 1299000,
    beds: 1,
    baths: 1,
    parking: 1,
    tag: "Reduced",
  },
];

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />
      <Browse />
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

function Browse() {
  return (
    <Section title="Browse available properties" tone="blue">
      <ListingsBrowser />
    </Section>
  );
}

function ListingsBrowser() {
  // Client-side controls without "use client" (keeps page server component friendly)
  // If you want live filtering, we can convert just this component into a client component.
  return (
    <div className="grid gap-4">
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

        <p className="mt-3 text-xs text-slate-500">
          Filtering is UI-only right now. Next step: wire to Supabase + real data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LISTINGS.map((l) => (
          <Link key={l.id} href={`/listings/${l.id}`} className="block">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{l.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {l.area}, {l.city}
                  </p>
                </div>
                {l.tag ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {l.tag}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 text-xl font-semibold">
                {formatZAR(l.price)}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <Stat label="Beds" value={l.beds} />
                <Stat label="Baths" value={l.baths} />
                <Stat label="Parking" value={l.parking} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                View details <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
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
