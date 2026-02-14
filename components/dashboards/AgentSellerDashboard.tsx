"use client";

import Link from "next/link";

export default function AgentSellerDashboard({
  profile,
}: {
  profile: { role: string; full_name: string | null };
}) {
  const name = profile.full_name ?? "Account";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {name} • {profile.role === "agent" ? "Agent" : "Private Seller"}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/leads" className="rounded-xl border px-4 py-2 text-sm">
            Leads
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Add Listing
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card label="Open Leads" value="0" />
        <Card label="Active Listings" value="0" />
        <Card label="This Week" value="0 viewings" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel title="Recent Leads">
          <Empty hint="Once leads are routed, they’ll show here." />
        </Panel>

        <Panel title="Your Listings">
          <Empty hint="Create your first listing to start receiving better matched leads." />
        </Panel>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Empty({ hint }: { hint: string }) {
  return <p className="text-sm text-slate-600">{hint}</p>;
}
