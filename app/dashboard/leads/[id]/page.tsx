"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Lead = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  score: number;
  created_at: string;
};

type LeadEvent = {
  id: string;
  event_type: string;
  body: string | null;
  created_at: string;
};

const STATUSES = ["new", "contacted", "qualified", "nurture", "viewing", "offer", "won", "lost"] as const;

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("new");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return router.push("/login");

      // Buyers shouldn’t access
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userRes.user.id).single();
      if (profile?.role === "buyer") return router.push("/dashboard");

      const { data: l, error: lErr } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, message, status, score, created_at")
        .eq("id", id)
        .single();

      if (lErr || !l) {
        setError(lErr?.message ?? "Lead not found.");
        setLoading(false);
        return;
      }

      setLead(l as Lead);
      setStatus((l as any).status ?? "new");

      const { data: ev, error: eErr } = await supabase
        .from("lead_events")
        .select("id, event_type, body, created_at")
        .eq("lead_id", id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (eErr) setError(eErr.message);
      setEvents((ev ?? []) as LeadEvent[]);
      setLoading(false);
    })();
  }, [id, router, supabase]);

  async function saveStatus() {
    if (!lead) return;
    setSaving(true);
    setError(null);

    const { error: uErr } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", lead.id);

    if (uErr) {
      setSaving(false);
      return setError(uErr.message);
    }

    // Add status change event
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;

    if (uid) {
      await supabase.from("lead_events").insert({
        lead_id: lead.id,
        actor_id: uid,
        event_type: "status_change",
        body: `Status changed to "${status}".`,
      });
    }

    setLead({ ...lead, status });
    // reload events
    const { data: ev } = await supabase
      .from("lead_events")
      .select("id, event_type, body, created_at")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    setEvents((ev ?? []) as LeadEvent[]);
    setSaving(false);
  }

  async function addNote() {
    if (!lead) return;
    const text = note.trim();
    if (!text) return;

    setSaving(true);
    setError(null);

    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      setSaving(false);
      return router.push("/login");
    }

    const { error: nErr } = await supabase.from("lead_events").insert({
      lead_id: lead.id,
      actor_id: uid,
      event_type: "note",
      body: text,
    });

    if (nErr) {
      setSaving(false);
      return setError(nErr.message);
    }

    setNote("");

    const { data: ev } = await supabase
      .from("lead_events")
      .select("id, event_type, body, created_at")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    setEvents((ev ?? []) as LeadEvent[]);
    setSaving(false);
  }

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading lead…</main>;

  if (!lead) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="text-sm text-red-600">{error ?? "Lead not found."}</p>
        <button className="mt-4 rounded-xl border px-4 py-2 text-sm" onClick={() => router.push("/dashboard/leads")}>
          Back to Leads
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {lead.full_name ?? lead.email ?? lead.phone ?? "Unnamed lead"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {lead.email ?? "—"} • {lead.phone ?? "—"}
          </p>
        </div>

        <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => router.push("/dashboard/leads")}>
          Back
        </button>
      </div>

      {lead.message && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Message</h2>
          <p className="mt-2 text-sm text-slate-700">{lead.message}</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-600">Status</p>
          <div className="mt-2 flex items-center gap-2">
            <select className="w-full rounded-xl border p-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={saveStatus}
              disabled={saving || status === lead.status}
            >
              Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-600">Score</p>
          <p className="mt-2 text-3xl font-semibold">{lead.score}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-600">Created</p>
          <p className="mt-2 text-sm text-slate-800">{new Date(lead.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="font-semibold">Add note</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="Type a note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:opacity-60"
            onClick={addNote}
            disabled={saving || note.trim().length === 0}
          >
            Add
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="font-semibold">Timeline</h2>

        {events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No events yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {events.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700">{e.event_type}</span>
                  <span className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString()}</span>
                </div>
                {e.body && <p className="mt-2 text-sm text-slate-700">{e.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
