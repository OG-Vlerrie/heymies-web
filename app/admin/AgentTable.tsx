"use client";

import { useMemo, useState } from "react";

type Agent = {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  full_name: string;
  email: string;
  phone: string | null;
  agency: string | null;
  areas: string | null;
  property_types: string | null;
  max_leads_per_week: number | null;
  preferred_contact_time: string | null;
};

export default function AgentTable({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = agents;
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (!s) return list;

    return list.filter((a) =>
      [
        a.full_name,
        a.email,
        a.phone || "",
        a.agency || "",
        a.areas || "",
        a.property_types || "",
        a.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [agents, q, filter]);

  async function setStatus(id: string, status: Agent["status"]) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } finally {
      setBusyId(null);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this agent application?")) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");

      setAgents((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = agents.filter((a) => a.status === "pending").length;

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, agency, area…"
            className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full md:w-44 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{agents.length}</span>
        </div>
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Agency</th>
              <th className="px-4 py-3 text-left font-semibold">Areas</th>
              <th className="px-4 py-3 text-left font-semibold">Types</th>
              <th className="px-4 py-3 text-left font-semibold">Max/wk</th>
              <th className="px-4 py-3 text-left font-semibold">Preferred time</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                      a.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : a.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    {a.status}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">{a.full_name}</td>

                <td className="px-4 py-3">
                  <a className="underline" href={`mailto:${a.email}`}>
                    {a.email}
                  </a>
                  {a.phone ? (
                    <div className="text-xs text-slate-500">{a.phone}</div>
                  ) : null}
                </td>

                <td className="px-4 py-3 text-slate-600">{a.agency || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{a.areas || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{a.property_types || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{a.max_leads_per_week ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{a.preferred_contact_time || "-"}</td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a.id, "approved")}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a.id, "rejected")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a.id, "pending")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Pending
                    </button>
                    <button
                      disabled={busyId === a.id}
                      onClick={() => del(a.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-slate-600">
                  No agents match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
