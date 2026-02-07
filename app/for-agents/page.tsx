"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Listing = {
  id: string;
  title: string;
  area: string;
  city: string;
  price: number;
  status: "Active" | "Pending" | "Sold";
};

type Lead = {
  id: string;
  name: string;
  listingId?: string;
  listingTitle?: string;
  stage: "New" | "Nurturing" | "Ready" | "Closed";
  lastContact: string; // e.g. "2026-02-07"
};

const DEMO_LISTINGS: Listing[] = [
  { id: "l-001", title: "Modern 2-bed apartment", area: "Sandton", city: "Johannesburg", price: 1899000, status: "Active" },
  { id: "l-002", title: "Family home with garden", area: "Durbanville", city: "Cape Town", price: 3495000, status: "Pending" },
  { id: "l-003", title: "Lock-up-and-go townhouse", area: "Umhlanga", city: "Durban", price: 2599000, status: "Active" },
];

const DEMO_LEADS: Lead[] = [
  { id: "ld-101", name: "Thabo M.", listingId: "l-001", listingTitle: "Modern 2-bed apartment", stage: "New", lastContact: "2026-02-06" },
  { id: "ld-102", name: "Samantha K.", listingId: "l-003", listingTitle: "Lock-up-and-go townhouse", stage: "Nurturing", lastContact: "2026-02-05" },
  { id: "ld-103", name: "Ayesha R.", listingId: "l-002", listingTitle: "Family home with garden", stage: "Ready", lastContact: "2026-02-07" },
  { id: "ld-104", name: "Johan P.", stage: "Closed", lastContact: "2026-02-01" },
];

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
}

export default function ForAgentsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

      {/* NEW: Dashboard */}
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
              "radial-gradient(ellipse at top, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.15) 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <h1 className="text-4xl font-semibold md:text-5xl">Built for agents, not portals</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          HeyMies helps you stop chasing leads and start speaking to buyers who are actually ready.
        </p>

        <div className="mt-8">
          <Link
            href="/#join"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Join HeyMies
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- DASHBOARD ----------------------------- */

function AgentDashboard() {
  const [tab, setTab] = useState<"listings" | "leads">("listings");
  const [q, setQ] = useState("");

  const { totalListings, activeListings, totalLeads, readyLeads } = useMemo(() => {
    const totalListings = DEMO_LISTINGS.length;
    const activeListings = DEMO_LISTINGS.filter((l) => l.status === "Active").length;
    const totalLeads = DEMO_LEADS.length;
    const readyLeads = DEMO_LEADS.filter((l) => l.stage === "Ready").length;
    return { totalListings, activeListings, totalLeads, readyLeads };
  }, []);

  const filteredListings = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DEMO_LISTINGS;
    return DEMO_LISTINGS.filter(
      (l) =>
        l.title.toLowerCase().includes(s) ||
        l.area.toLowerCase().includes(s) ||
        l.city.toLowerCase().includes(s)
    );
  }, [q]);

  const filteredLeads = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DEMO_LEADS;
    return DEMO_LEADS.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        (l.listingTitle || "").toLowerCase().includes(s) ||
        l.stage.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Agent Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              This is a preview dashboard. Next step: connect to your agent account + Supabase so this is real data.
            </p>
          </div>

          <div className="w-full md:w-[360px]">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings or leads…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Kpi label="Total listings" value={totalListings} />
          <Kpi label="Active listings" value={activeListings} />
          <Kpi label="Total leads" value={totalLeads} />
          <Kpi label="Ready leads" value={readyLeads} />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <TabButton active={tab === "listings"} onClick={() => setTab("listings")}>
            My Listings
          </TabButton>
          <TabButton active={tab === "leads"} onClick={() => setTab("leads")}>
            My Leads
          </TabButton>

          <div className="ml-auto text-xs text-slate-500">
            Showing {tab === "listings" ? filteredListings.length : filteredLeads.length} items
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          {tab === "listings" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredListings.map((l) => (
                <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{l.title}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {l.area}, {l.city}
                      </div>
                    </div>
                    <Pill tone={l.status === "Active" ? "green" : l.status === "Pending" ? "blue" : "slate"}>
                      {l.status}
                    </Pill>
                  </div>

                  <div className="mt-4 text-xl font-semibold">{formatZAR(l.price)}</div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/listings/${l.id}`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      View
                    </Link>
                    <button
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      onClick={() => alert("Next step: open Edit Listing modal")}
                      type="button"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Last contact</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-4 py-3 font-semibold">{l.name}</td>
                      <td className="px-4 py-3 text-slate-700">{l.listingTitle || "—"}</td>
                      <td className="px-4 py-3">
                        <Pill
                          tone={
                            l.stage === "Ready"
                              ? "green"
                              : l.stage === "Nurturing"
                              ? "blue"
                              : l.stage === "Closed"
                              ? "slate"
                              : "emerald"
                          }
                        >
                          {l.stage}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{l.lastContact}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                          onClick={() => alert("Next step: open Lead detail drawer")}
                          type="button"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
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

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "blue" | "slate" | "emerald";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

/* ----------------------------- PAIN ----------------------------- */

function Pain() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">The problem agents live with every day</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>Paying for leads that never answer.</Card>
          <Card>Racing other agents for the same enquiry.</Card>
          <Card>Spending hours qualifying buyers who aren’t ready.</Card>
          <Card>The risk always sits with you.</Card>
        </div>

        <p className="mt-6 font-semibold">More leads don’t solve this. Better leads do.</p>
      </div>
    </section>
  );
}

/* ----------------------------- VALUE ----------------------------- */

function Value() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">What HeyMies does differently</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <strong>Qualification first</strong>
            <p className="mt-2 text-sm text-slate-700">
              Leads are scored based on behaviour, engagement, and intent — not just a form fill.
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
    <section>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-2xl font-semibold">Traditional portals vs HeyMies</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
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
        <p className="mt-3 text-slate-300">Early access for agents who value their time.</p>

        <div className="mt-8">
          <Link
            href="/#join"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
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
  return <div className="rounded-xl border bg-white p-6">{children}</div>;
}

function Benefit({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-emerald-200 bg-white p-5 font-medium">{children}</div>;
}
