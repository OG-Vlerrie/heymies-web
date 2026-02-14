"use client";

import Link from "next/link";

export default function BuyerDashboard({
  profile,
}: {
  profile: { role: string; full_name: string | null };
}) {
  const name = profile.full_name ?? "Buyer";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Buyer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">{name}</p>
        </div>

        <div className="flex gap-2">
          <Link href="/listings" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            Browse Listings
          </Link>
          <Link href="/dashboard/saved" className="rounded-xl border px-4 py-2 text-sm">
            Saved
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card label="Saved Listings" value="0" />
        <Card label="Enquiries" value="0" />
        <Card label="Matches" value="0" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Next</h2>
        <p className="mt-2 text-sm text-slate-600">
          We’ll add: saved listings, alerts, and a simple preferences panel (budget, areas, bedrooms).
        </p>
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
