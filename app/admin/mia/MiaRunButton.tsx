"use client";

import { useState } from "react";

export default function MiaRunButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function runMia() {
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/mia/run-nurture", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Mia run failed.");

      setResult(
        `Checked ${data.checked ?? 0}, sent ${data.sent ?? 0}, paused ${data.paused ?? 0}, skipped ${data.skipped ?? 0}.`
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Mia run failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Manual run
      </p>
      <h2 className="mt-2 text-xl font-semibold">Wake Mia now</h2>
      <p className="mt-2 text-sm text-slate-600">
        Runs the same nurture job as the daily schedule for currently due enquiries.
      </p>
      <button
        type="button"
        onClick={runMia}
        disabled={running}
        className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {running ? "Running..." : "Run Mia"}
      </button>
      {result ? <p className="mt-3 text-sm text-slate-600">{result}</p> : null}
    </div>
  );
}
