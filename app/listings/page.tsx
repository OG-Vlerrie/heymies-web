import { createClient } from "@supabase/supabase-js";
import ListingsClient, { type PublicListing } from "./ListingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function ListingsPage() {
  let listings: PublicListing[] = [];
  let error: string | null = null;

  try {
    const { data, error: loadErr } = await supabasePublic()
      .from("listings")
      .select(
        "id, title, suburb, city, price, price_per_month, sale_type, listing_type, bedrooms, bathrooms, parking, cover_image, status, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60);

    if (loadErr) error = loadErr.message;
    else listings = (data ?? []) as PublicListing[];
  } catch (e: any) {
    error = e?.message ?? "Could not load listings.";
  }

  return (
    <main className="tech-page">
      <Hero />
      <Section title="Browse available properties" tone="alt">
        <ListingsClient initialListings={listings} initialError={error} />
      </Section>
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
      <div className="mx-auto max-w-6xl">(c) {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}
