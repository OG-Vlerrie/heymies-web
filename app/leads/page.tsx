"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "agent" | "seller" | "buyer" | "admin";

type Lead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  score: number;
  created_at: string;
};

export default function LeadsPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return router.push("/login");

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (pErr || !profile) {
        setError(pErr?.message ?? "Profile missing");
        setLoading(false);
        return;
      }

      if (profile.role === "buyer") {
        router.push("/dashboard");
        return;
      }

      setRole(profile.role);

      const { data, error: lErr } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, status, score, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (lErr) setError(lErr.message);
      setLeads((data ?? []) as Lead[]);
      setLoading(false);
    })();
  }, [router, supabase]);

  const filtered = leads.filter((l) => {
    const hay = `${l.full_name ?? ""} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading leads…</main>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-slate-600">
            {role === "agent" ? "Agent" : "Private Seller"} leads assigned to you
          </p>
        </div>

        <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm">
          Back
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          className="w-full max-w-md rounded-xl border p-3 text-sm"
          placeholder="Search name, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="text-sm text-slate-600">{filtered.length}</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
        {filtered.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">No leads yet.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((l) => (
              <li key={l.id} className="p-4 hover:bg-slate-50">
                <Link href={`/dashboard/leads/${l.id}`} className="block">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {l.full_name ?? l.email ?? l.phone ?? "Unnamed lead"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {l.email ?? "—"} • {l.phone ?? "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusPill status={l.status} />
                      <span className="text-xs text-slate-500">Score: {l.score}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const base = "rounded-full border px-3 py-1 text-xs font-medium";

  if (s === "new") return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}>New</span>;
  if (s === "contacted") return <span className={`${base} border-blue-200 bg-blue-50 text-blue-800`}>Contacted</span>;
  if (s === "qualified") return <span className={`${base} border-violet-200 bg-violet-50 text-violet-800`}>Qualified</span>;
  if (s === "nurture") return <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>Nurture</span>;
  if (s === "viewing") return <span className={`${base} border-slate-200 bg-slate-50 text-slate-800`}>Viewing</span>;
  if (s === "offer") return <span className={`${base} border-slate-200 bg-slate-50 text-slate-800`}>Offer</span>;
  if (s === "won") return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}>Won</span>;
  if (s === "lost") return <span className={`${base} border-red-200 bg-red-50 text-red-700`}>Lost</span>;

  return <span className={`${base} border-slate-200 bg-white text-slate-700`}>{status}</span>;
}
