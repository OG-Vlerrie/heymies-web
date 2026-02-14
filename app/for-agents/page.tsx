"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function ForAgentsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

<<<<<<< HEAD
=======
      {/* NEW: list-style filters */}
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
      <AgentDashboard />
      <Pain />
      <Value />
      <HowItHelps />
      <Comparison />
      <FinalCTA />
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
<<<<<<< HEAD
              "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.25) 35%, rgba(16,185,129,0.12) 60%, transparent 85%)",
=======
              "radial-gradient(ellipse at top, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.15) 40%, transparent 75%)",
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
          }}
        />
      </div>

<<<<<<< HEAD
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl">
          Built for agents, not portals
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          HeyMies helps you stop chasing leads and start speaking to buyers who are actually ready.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/#join"
            className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Join HeyMies
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-xl border border-slate-300 px-7 py-3 text-sm font-semibold hover:bg-white/60"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
=======
      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <h1 className="text-4xl font-semibold md:text-5xl">
          Built for agents, not portals
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          HeyMies helps you stop chasing leads and start speaking to buyers who
          are actually ready.
        </p>

        <div className="mt-8">
          <Link
            href="/#join"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Join HeyMies
          </Link>
        </div>
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
      </div>
    </section>
  );
}

<<<<<<< HEAD
/* ----------------------------- DASHBOARD ----------------------------- */
=======
/* ----------------------------- LIST-STYLE FILTERS ----------------------------- */
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36

function AgentDashboard() {
  type Listing = {
    id: string;
    title: string;
    city: string;
    suburb: string;
    price: number;
  };

  type Lead = {
    id: string;
    name: string;
    listingId?: string;
    listingTitle?: string;
    stage: "New" | "Nurturing" | "Ready" | "Closed";
    lastContact: string;
  };

  const AGENT = {
    name: "Gerhard",
    agency: "HeyMies Partner Agent",
    email: "agent@heymies.co.za",
    phone: "+27 00 000 0000",
    area: "Johannesburg • Sandton",
  };

  const LISTINGS: Listing[] = [
    { id: "l1", title: "Modern 2-bed apartment", city: "Johannesburg", suburb: "Sandton", price: 1899000 },
    { id: "l2", title: "1-bed investor unit", city: "Johannesburg", suburb: "Rosebank", price: 1299000 },
    { id: "l3", title: "Family home with garden", city: "Cape Town", suburb: "Gardens", price: 3495000 },
    { id: "l4", title: "Sea-facing apartment", city: "Cape Town", suburb: "Sea Point", price: 5250000 },
    { id: "l5", title: "Lock-up-and-go townhouse", city: "Durban", suburb: "Umhlanga", price: 2599000 },
    { id: "l6", title: "Starter apartment near transport", city: "Pretoria", suburb: "Hatfield", price: 995000 },
  ];

  const LEADS: Lead[] = [
    { id: "ld1", name: "Thabo M.", listingId: "l1", listingTitle: "Modern 2-bed apartment", stage: "New", lastContact: "2026-02-06" },
    { id: "ld2", name: "Samantha K.", listingId: "l5", listingTitle: "Lock-up-and-go townhouse", stage: "Nurturing", lastContact: "2026-02-05" },
    { id: "ld3", name: "Ayesha R.", listingId: "l3", listingTitle: "Family home with garden", stage: "Ready", lastContact: "2026-02-07" },
    { id: "ld4", name: "Johan P.", stage: "Closed", lastContact: "2026-02-01" },
  ];

  const PRICE_BUCKETS = [
    { key: "u1", label: "Under R1,000,000", min: 0, max: 999_999 },
    { key: "1-2", label: "R1,000,000 – R2,000,000", min: 1_000_000, max: 2_000_000 },
    { key: "2-5", label: "R2,000,000 – R5,000,000", min: 2_000_000, max: 5_000_000 },
    { key: "5p", label: "R5,000,000+", min: 5_000_000, max: Number.POSITIVE_INFINITY },
  ] as const;

  const CITIES = ["Cape Town", "Johannesburg", "Pretoria", "Durban"] as const;

  const SUBURBS_BY_CITY: Record<string, string[]> = {
    "Cape Town": ["Sea Point", "Gardens"],
    Johannesburg: ["Sandton", "Rosebank"],
    Pretoria: ["Hatfield"],
    Durban: ["Umhlanga"],
  };

  const [tab, setTab] = useState<"listings" | "leads">("listings");

  const [city, setCity] = useState<string>("");
  const [suburb, setSuburb] = useState<string>("");
  const [priceKey, setPriceKey] = useState<string>("");
  const [applied, setApplied] = useState(false);

  const suburbs = city ? SUBURBS_BY_CITY[city] ?? [] : [];

  const filteredListings = useMemo(() => {
    let rows = [...LISTINGS];

    if (city) rows = rows.filter((l) => l.city === city);
    if (suburb) rows = rows.filter((l) => l.suburb === suburb);

    if (priceKey) {
      const bucket = PRICE_BUCKETS.find((b) => b.key === priceKey);
      if (bucket) rows = rows.filter((l) => l.price >= bucket.min && l.price <= bucket.max);
    }

    return rows.sort((a, b) => a.price - b.price);
  }, [city, suburb, priceKey]);

<<<<<<< HEAD
  const filteredLeads = useMemo(() => [...LEADS], []);
=======
  const filteredLeads = useMemo(() => {
    // For now just show all; later filter by listing selection if you want.
    return [...LEADS];
  }, []);
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36

  const formatZAR = (n: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

  const kpi = useMemo(() => {
    const totalListings = LISTINGS.length;
    const totalLeads = LEADS.length;
    const ready = LEADS.filter((l) => l.stage === "Ready").length;
    const nurturing = LEADS.filter((l) => l.stage === "Nurturing").length;
    return { totalListings, totalLeads, ready, nurturing };
  }, []);

  return (
    <section className="bg-blue-50">
<<<<<<< HEAD
      <div className="mx-auto max-w-6xl px-4 py-16">
=======
      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* Agent header */}
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Agent Dashboard</h2>
            <p className="mt-2 text-slate-700">
              Welcome back, <span className="font-semibold">{AGENT.name}</span>.
            </p>
            <div className="mt-3 text-sm text-slate-600">
              {AGENT.agency} • {AGENT.area}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {AGENT.email} • {AGENT.phone}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
<<<<<<< HEAD
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-white/60"
=======
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-white/70"
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
              onClick={() => alert("Next: add listing flow")}
            >
              Add listing
            </button>
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={() => alert("Next: export/report")}
            >
              Export
            </button>
          </div>
        </div>

<<<<<<< HEAD
        <div className="mt-8 grid gap-4 md:grid-cols-4">
=======
        {/* KPI strip */}
        <div className="mt-8 grid gap-3 md:grid-cols-4">
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
          <Kpi label="Listings" value={kpi.totalListings} />
          <Kpi label="Leads" value={kpi.totalLeads} />
          <Kpi label="Ready" value={kpi.ready} />
          <Kpi label="Nurturing" value={kpi.nurturing} />
        </div>

<<<<<<< HEAD
=======
        {/* Tabs */}
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <TabButton active={tab === "listings"} onClick={() => setTab("listings")}>
            Your Listings
          </TabButton>
          <TabButton active={tab === "leads"} onClick={() => setTab("leads")}>
            Your Leads
          </TabButton>
        </div>

<<<<<<< HEAD
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
=======
        {/* Content */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
          {tab === "listings" ? (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">City / Town</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSuburb("");
                      setApplied(false);
                    }}
                  >
                    <option value="">Select city or town</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Suburb</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                    value={suburb}
                    onChange={(e) => {
                      setSuburb(e.target.value);
                      setApplied(false);
                    }}
                    disabled={!city}
                  >
                    <option value="">{city ? "Select suburb" : "Select city first"}</option>
                    {suburbs.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Price range</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                    value={priceKey}
                    onChange={(e) => {
                      setPriceKey(e.target.value);
                      setApplied(false);
                    }}
                  >
                    <option value="">Select price range</option>
                    {PRICE_BUCKETS.map((b) => (
                      <option key={b.key} value={b.key}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => setApplied(true)}
              >
                Apply filters
              </button>

              {applied ? (
                <div className="mt-8">
                  <div className="flex items-end justify-between">
                    <h3 className="text-lg font-semibold">Listings in selection</h3>
                    <div className="text-sm text-slate-600">{filteredListings.length} listing(s)</div>
                  </div>

                  {filteredListings.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-600">No listings match that selection.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                      {filteredListings.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-4 px-4 py-4">
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{l.title}</div>
                            <div className="mt-1 text-sm text-slate-600">
                              {l.suburb}, {l.city}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-slate-900">{formatZAR(l.price)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-600">
                  Select City → Suburb → Price, then click <span className="font-semibold">Apply filters</span>.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <h3 className="text-lg font-semibold">Your Leads</h3>
                <div className="text-sm text-slate-600">{filteredLeads.length} lead(s)</div>
              </div>

              <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {filteredLeads.map((l) => (
                  <li key={l.id} className="flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{l.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {l.listingTitle ? l.listingTitle : "No listing linked"} • Last contact: {l.lastContact}
                      </div>
                    </div>
                    <span className={`mt-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${stageClass(l.stage)}`}>
                      {l.stage}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function stageClass(stage: string) {
  if (stage === "Ready") return "bg-emerald-50 text-emerald-700";
  if (stage === "Nurturing") return "bg-blue-50 text-blue-700";
  if (stage === "Closed") return "bg-slate-100 text-slate-700";
  return "bg-emerald-100 text-emerald-800";
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
<<<<<<< HEAD
    <div className="rounded-xl border border-slate-200 bg-white p-5">
=======
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-white/60"
      }
    >
      {children}
    </button>
  );
}

<<<<<<< HEAD
=======

>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
/* ----------------------------- PAIN ----------------------------- */

function Pain() {
  return (
<<<<<<< HEAD
    <section className="bg-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">The problem agents live with every day</h2>
=======
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          The problem agents live with every day
        </h2>
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36

        <ul className="mt-8 space-y-3 text-slate-700">
          <li>• Paying for leads that never answer</li>
          <li>• Competing with other agents on speed, not quality</li>
          <li>• Spending hours qualifying buyers who aren’t ready</li>
          <li>• Carrying all the risk</li>
        </ul>

<<<<<<< HEAD
        <p className="mt-6 font-semibold">More leads don’t solve this. Better leads do.</p>
=======
        <p className="mt-6 font-semibold">
          More leads don’t solve this. Better leads do.
        </p>
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
      </div>
    </section>
  );
}

/* ----------------------------- VALUE ----------------------------- */

function Value() {
  return (
<<<<<<< HEAD
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">What HeyMies does differently</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card>
            <strong>Qualification first</strong>
            <p className="mt-2 text-sm text-slate-700">
              Leads are scored based on behaviour, engagement, and intent — not just a form fill.
=======
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          What HeyMies does differently
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <strong>Qualification first</strong>
            <p className="mt-2 text-sm text-slate-700">
              Leads are scored based on behaviour, engagement, and intent — not
              just a form fill.
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
            </p>
          </Card>

          <Card>
            <strong>Nurture without effort</strong>
            <p className="mt-2 text-sm text-slate-700">
              Automated follow-ups keep buyers warm until they’re ready to act.
            </p>
          </Card>

          <Card>
            <strong>Hand-off at the right time</strong>
            <p className="mt-2 text-sm text-slate-700">
              You only engage when there’s a real opportunity to close.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- HOW IT HELPS ----------------------------- */

function HowItHelps() {
  return (
    <section className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">What this means for you</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Benefit>Fewer calls, higher intent conversations</Benefit>
          <Benefit>Less admin, more selling</Benefit>
          <Benefit>Better use of your marketing spend</Benefit>
          <Benefit>Control over when a lead is worth your time</Benefit>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- COMPARISON ----------------------------- */

function Comparison() {
  return (
<<<<<<< HEAD
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">Traditional portals vs HeyMies</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
=======
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">
          Traditional portals vs HeyMies
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
          <Card>
            <strong>Traditional portals</strong>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Pay for exposure</li>
              <li>Compete on speed</li>
              <li>Chase every enquiry</li>
              <li>Unqualified buyers</li>
            </ul>
          </Card>

          <Card>
            <strong>HeyMies</strong>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Pay for readiness</li>
              <li>Compete on relevance</li>
              <li>Speak when it matters</li>
              <li>Buyers with intent</li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CTA ----------------------------- */

function FinalCTA() {
  return (
    <section className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">Stop chasing. Start closing.</h2>
<<<<<<< HEAD
        <p className="mt-3 text-slate-300">Early access for agents who value their time.</p>
=======
        <p className="mt-3 text-slate-300">
          Early access for agents who value their time.
        </p>
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36

        <div className="mt-8">
          <Link
            href="/#join"
<<<<<<< HEAD
            className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
=======
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
          >
            Join HeyMies
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */

function Footer() {
  return (
    <footer className="border-t px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}

/* ----------------------------- UI ----------------------------- */

function Card({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  return <div className="rounded-xl border border-slate-200 bg-white p-5">{children}</div>;
=======
  return <div className="rounded-xl border bg-white p-6">{children}</div>;
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-5 font-medium">
      {children}
    </div>
  );
}
