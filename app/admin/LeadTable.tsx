"use client";

import { useMemo, useState } from "react";

type Lead = {
  id: string;
  email: string;
  source: string | null;
  tag: string | null;
  created_at: string;
};

export default function LeadTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter(
      (l) =>
        l.email.toLowerCase().includes(s) ||
        (l.source || "").toLowerCase().includes(s) ||
        (l.tag || "").toLowerCase().includes(s)
    );
  }, [leads, q]);

  async function setTag(id: string, tag: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tag }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, tag: tag || null } : l)));
    } finally {
      setBusyId(null);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this lead?")) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setLeads((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email, source, tag…"
          className="w-full md:max-w-sm rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
        />
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{leads.length}</span>
        </div>
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Created</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Source</th>
              <th className="px-4 py-3 text-left font-semibold">Tag</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-slate-200">
                <td className="px-4 py-3 whitespace-nowrap">{fmt(l.created_at)}</td>
                <td className="px-4 py-3">
                  <a className="underline" href={`mailto:${l.email}`}>
                    {l.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.source || "-"}</td>
                <td className="px-4 py-3">
                  <select
                    value={l.tag || ""}
                    disabled={busyId === l.id}
                    onChange={(e) => setTag(l.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  >
                    <option value="">—</option>
                    <option value="hot">hot</option>
                    <option value="warm">warm</option>
                    <option value="cold">cold</option>
                    <option value="test">test</option>
                    <option value="spam">spam</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={busyId === l.id}
                    onClick={() => del(l.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-slate-600">
                  No leads match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}
