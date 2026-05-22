"use client";

import { useState } from "react";

type AlertRow = {
  id: string;
  name: string;
  enabled: boolean;
  areas: string[] | null;
  max_price: number | null;
  created_at: string;
};

type MatchEventRow = {
  id: string;
  score: number;
  reasons: string[] | null;
  status: string;
  created_at: string;
  listing?: { title: string | null } | null;
};

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function QualityPanel({
  alerts,
  matchEvents,
  unavailable,
}: {
  alerts: AlertRow[];
  matchEvents: MatchEventRow[];
  unavailable?: string | null;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function runMatcher() {
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/matching/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minScore: 55 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Matcher failed");
      setResult(
        `Checked ${data.listingsChecked} listings and ${data.alertsChecked} alerts. Created ${data.eventsCreated} events.`
      );
    } catch (e: any) {
      setResult(e?.message ?? "Matcher failed.");
    } finally {
      setRunning(false);
    }
  }

  if (unavailable) {
    return (
      <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Apply the Supabase alert migration to enable quality controls. {unavailable}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Active alerts
        </p>
        <p className="mt-2 text-3xl font-semibold">
          {alerts.filter((alert) => alert.enabled).length}
        </p>
        <p className="mt-2 text-sm text-slate-600">{alerts.length} total saved alerts</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pending matches
        </p>
        <p className="mt-2 text-3xl font-semibold">
          {matchEvents.filter((event) => event.status === "pending").length}
        </p>
        <p className="mt-2 text-sm text-slate-600">{matchEvents.length} recent match events</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Matcher
        </p>
        <button
          type="button"
          onClick={runMatcher}
          disabled={running}
          className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? "Running..." : "Run matcher"}
        </button>
        {result ? <p className="mt-3 text-sm text-slate-600">{result}</p> : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
        <h3 className="font-semibold">Recent alerts</h3>
        <div className="mt-4 space-y-3">
          {alerts.slice(0, 6).map((alert) => (
            <div key={alert.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{alert.name}</p>
                <span className="text-xs text-slate-500">{alert.enabled ? "Active" : "Paused"}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {(alert.areas ?? []).join(", ") || "Any area"} /{" "}
                {alert.max_price ? formatZAR(alert.max_price) : "Any budget"}
              </p>
            </div>
          ))}
          {alerts.length === 0 ? <p className="text-sm text-slate-600">No alerts yet.</p> : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="font-semibold">Recent match events</h3>
        <div className="mt-4 space-y-3">
          {matchEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{event.listing?.title ?? "Listing match"}</p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {event.score}% fit
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {(event.reasons ?? []).join(", ") || "No reasons"} / {event.status}
              </p>
            </div>
          ))}
          {matchEvents.length === 0 ? (
            <p className="text-sm text-slate-600">No match events yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
