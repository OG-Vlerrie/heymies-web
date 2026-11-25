import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ListingsClient, { type PublicListing } from "./listings/ListingsClient";
import { TechCard, TechFooter } from "@/components/TechPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const paths = [
  {
    title: "Buying a home?",
    body: "Save favourites, compare properties, and get guidance based on your search.",
    href: "/for-buyers",
    label: "How HeyMies helps buyers",
  },
  {
    title: "Selling privately?",
    body: "Create your listing and connect with buyers who are ready to take the next step.",
    href: "/for-private-sellers",
    label: "List your property",
  },
  {
    title: "Working in property?",
    body: "Turn property enquiries into better-qualified, better-timed conversations.",
    href: "/for-agents",
    label: "HeyMies for agents",
  },
];

function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function HomePage() {
  let listings: PublicListing[] = [];
  let error: string | null = null;

  try {
    const { data, error: loadError } = await supabasePublic()
      .from("listings")
      .select(
        "id, title, suburb, city, price, price_per_month, sale_type, listing_type, bedrooms, bathrooms, parking, cover_image, images, status, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60);

    if (loadError) error = loadError.message;
    else listings = (data ?? []) as PublicListing[];
  } catch (loadError: unknown) {
    error = loadError instanceof Error ? loadError.message : "Could not load listings.";
  }

  return (
    <main className="tech-page">
      <section className="tech-hero border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center md:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            HeyMies property marketplace
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Find a place that fits.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Browse homes for sale and to rent, then let HeyMies help you take the next step.
          </p>
        </div>
      </section>

      <section className="tech-section-alt">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="tech-kicker">Homes on HeyMies</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Browse available properties
              </h2>
            </div>
            <Link href="/signup/buyer" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Create a buyer profile
            </Link>
          </div>

          <ListingsClient initialListings={listings} initialError={error} compact />
        </div>
      </section>

      <section className="tech-section">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <div className="max-w-2xl">
            <p className="tech-kicker">More than a property search</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              A smoother way from browsing to moving.
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              HeyMies helps buyers find the right fit, sellers present their homes,
              and agents focus on the conversations that matter.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {paths.map((path) => (
              <TechCard key={path.title}>
                <h3 className="text-xl font-semibold text-slate-950">{path.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">{path.body}</p>
                <Link href={path.href} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  {path.label} <span aria-hidden className="ml-1">→</span>
                </Link>
              </TechCard>
            ))}
          </div>
        </div>
      </section>

      <TechFooter />
    </main>
  );
}
