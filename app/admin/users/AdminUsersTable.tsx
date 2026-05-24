"use client";

import { useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  metadata_role: string | null;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  marketing_emails: boolean | null;
  nurture_emails: boolean | null;
  match_alert_emails: boolean | null;
  unsubscribed_at: string | null;
};

type Filter = "all" | "buyer" | "agent" | "seller" | "missing_profile" | "unconfirmed";

export default function AdminUsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = users;

    if (filter === "missing_profile") list = list.filter((user) => !user.role);
    else if (filter === "unconfirmed") list = list.filter((user) => !user.email_confirmed_at);
    else if (filter !== "all") list = list.filter((user) => normalizeRole(user.role) === filter);

    if (!s) return list;

    return list.filter((user) =>
      [
        user.email ?? "",
        user.full_name ?? "",
        user.phone ?? "",
        user.role ?? "",
        user.metadata_role ?? "",
        user.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [filter, q, users]);

  async function setRole(id: string, role: "buyer" | "agent" | "seller") {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update role.");

      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update role.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search email, name, phone, id..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 md:w-96"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none md:w-48"
          >
            <option value="all">All users</option>
            <option value="buyer">Buyers</option>
            <option value="agent">Agents</option>
            <option value="seller">Private sellers</option>
            <option value="missing_profile">Missing profile</option>
            <option value="unconfirmed">Unconfirmed</option>
          </select>
        </div>

        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Confirmation</th>
              <th className="px-4 py-3 text-left font-semibold">Email prefs</th>
              <th className="px-4 py-3 text-left font-semibold">Activity</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{user.full_name ?? user.email ?? "Unnamed user"}</p>
                  {user.email ? (
                    <a className="mt-1 block text-xs underline" href={`mailto:${user.email}`}>
                      {user.email}
                    </a>
                  ) : null}
                  {user.phone ? <p className="mt-1 text-xs text-slate-500">{user.phone}</p> : null}
                  <p className="mt-1 max-w-48 truncate text-xs text-slate-400">{user.id}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={user.role ?? "missing"} />
                  {user.metadata_role && user.metadata_role !== user.role ? (
                    <p className="mt-2 text-xs text-amber-700">Signup metadata: {user.metadata_role}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {user.email_confirmed_at ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Confirmed
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      Waiting
                    </span>
                  )}
                  <p className="mt-2 text-xs">{user.email_confirmed_at ? formatDate(user.email_confirmed_at) : "-"}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {user.unsubscribed_at ? (
                    <p className="font-semibold text-red-700">Unsubscribed</p>
                  ) : (
                    <p className="font-semibold text-emerald-700">Subscribed</p>
                  )}
                  <p className="mt-1">Marketing: {formatBool(user.marketing_emails)}</p>
                  <p>Mia nurture: {formatBool(user.nurture_emails)}</p>
                  <p>Matches: {formatBool(user.match_alert_emails)}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  <p>Created: {user.created_at ? formatDate(user.created_at) : "-"}</p>
                  <p className="mt-1">Last sign in: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "-"}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-44 flex-wrap gap-2">
                    <button
                      disabled={busyId === user.id}
                      onClick={() => setRole(user.id, "buyer")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Buyer
                    </button>
                    <button
                      disabled={busyId === user.id}
                      onClick={() => setRole(user.id, "agent")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Agent
                    </button>
                    <button
                      disabled={busyId === user.id}
                      onClick={() => setRole(user.id, "seller")}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Seller
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-slate-600">
                  No users match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function normalizeRole(role: string | null) {
  if (role === "private_seller") return "seller";
  return role;
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "buyer"
      ? "border-sky-200 bg-sky-50 text-sky-800"
      : status === "agent"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : status === "seller" || status === "private_seller"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function formatBool(value: boolean | null) {
  if (value === null) return "-";
  return value ? "on" : "off";
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
